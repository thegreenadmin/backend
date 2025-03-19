require("custom-env").env(true);

const moment = require("moment");
const config = require("./../config/config.json");
const { Op } = require("sequelize");
const logger = require("../logger/logger");
const csc = require("country-state-city");
const iso3166 = require("iso-3166-2");
const XLSX = require("xlsx");

const Permission = require("../models/store/permission.model");
const Role = require("../models/store/role.model");
const Store = require("../models/store/store.model");
const StoreUser = require("../models/store/store_users.model");
const StoreUserRole = require("../models/store/store_user_role.model");
const User = require("../models/user/user.model");
const UserProof = require("../models/user/user_proof.model");
const MESSAGES = require("../utils/messages.util");
const OrderServiceCharge = require("../models/order/order_service_charge.model");
const Controller = require("../models/module/controller.model");
const UserSession = require("../models/user/user_sessions.model");
const PaymentService = require("../models/transaction/payment_service.model");
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model");
const StoreServiceCharge = require("../models/store/store_service_charge.model");
const NotificationSetting = require("../models/notification/notification_setting.model");
const Tax = require("../models/tax/tax.model");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const upsert = async function (Model, obj, whereObj, __SQL_TRANSACTION) {
  try {
    const row = await Model.findOne({
      where: whereObj,
      transaction: __SQL_TRANSACTION,
    });
    if (!row) {
      return await Model.create(obj, { transaction: __SQL_TRANSACTION });
    }
    return await Model.update(obj, { where: { id: row.id } });
  } catch (err) {
    throw err;
  }
};

const getControllerByControllerKey = async function (
  controller_key,
  shouldThrowError = false
) {
  try {
    const controller = await Controller.findOne({
      where: { controller_key, status: "active" },
    });
    if (!controller) {
      if (shouldThrowError) {
        throw MESSAGES.CONTROLLER_NOT_FOUND;
      }
      return null;
    }
    return controller;
  } catch (err) {
    throw err;
  }
};

const getControllerById = async function (
  controller_id,
  shouldThrowError = false
) {
  try {
    const controller = await Controller.findOne({
      where: { id: controller_id, status: "active" },
    });
    if (!controller) {
      if (shouldThrowError) {
        throw MESSAGES.CONTROLLER_NOT_FOUND;
      }
      return null;
    }
    return controller;
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {verified_user}
 * @description check if user is verified or not
 *  */
const isUserVerified = async function (user_id) {
  try {
    let __IS_USER_VERIFIED = false;
    const __USER_VERIFICATION_PROOFS = await UserProof.findAll({
      where: {
        user_id: user_id,
        status: "active",
        is_verified: true,
      },
    });

    for (const proof of __USER_VERIFICATION_PROOFS) {
      if (proof.is_verified) {
        if (proof.expiredAt) {
          const currentData = moment().utc();
          const expiredAt = moment(proof.expiredAt).utc();
          if (currentData.isBefore(expiredAt)) {
            __IS_USER_VERIFIED = true;
          }
        } else {
          __IS_USER_VERIFIED = true;
        }
        break;
      }
    }

    return __IS_USER_VERIFIED;
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_status}
 * @description check wheter the store user has permission to particular controller or not
 *  */
const checkStoreStatus = async function (store_id) {
  const store = await Store.findOne({
    where: { id: store_id, status: "active" },
  });

  if (!store) {
    throw MESSAGES.STORE_UNAVAILABLE;
  }

  return true;
};

/**
 * @implements {store_user}
 * @description check wheter the store user belongs to store
 *  */
const isUserBelongsToStore = async function (store_id, user_id) {
  const storeStatus = await checkStoreStatus(store_id);
  const user = await User.findOne({
    where: { id: user_id, status: "active" },
    include: [
      {
        model: StoreUser,
        where: {
          user_id: user_id,
          is_verified: true,
          store_id,
          status: "active",
        },
        required: true,
      },
    ],
  });

  if (user) {
    return true;
  }

  throw MESSAGES.STORE_USER_NOT_FOUND;
};

/**
 * @implements {pagination_result}
 * @description check wheter the store user has permission to particular controller or not
 *  */
const getPaginationResult = async function ({
  Model,
  query,
  page,
  page_size,
  order,
  as,
}) {
  page = parseInt(page ? page : 1); // Current page number
  const limit = parseInt(page_size ? page_size : 10); // Number of results per page
  const offset = (page - 1) * limit; // Starting index of results to be returned
  const data = await Model.findAndCountAll({
    distinct: true,
    ...query,
    limit,
    offset,
    order,
  });
  return {
    total_count: data.count,
    [as]: data.rows,
  };
};

const getFullResult = async function ({ Model, query, order, as }) {
  const data = await Model.findAll({
    query,
    order,
  });

  return {
    total_count: data.length,
    [as]: data,
  };
};

/**
 * @implements {bulk_create_update_delete}
 * @description check wheter the store user has permission to particular controller or not
 *  */
const bulkCreateUpdateDelete = async function (
  Model,
  dataArr = [],
  key,
  whereKeys = {},
  __SQL_TRANSACTION
) {
  try {
    const bulkCreateObj = [];
    const bulkDeleteIds = [];
    for (let i = 0; i < dataArr.length; i++) {
      const data = dataArr[i];
      if (!data[key]) {
        delete data[key];
        bulkCreateObj.push(data);
      } else if (data[key].status == "deleted" && data[key]) {
        bulkDeleteIds.push(data[key]);
      } else {
        const id = data[key];
        delete data[key];
        await Model.update(
          { ...data },
          {
            where: { id, ...whereKeys, status: "active" },
            transaction: __SQL_TRANSACTION,
          }
        );
      }
    }

    await Model.update(
      { status: "deleted" },
      {
        where: { id: { [Op.in]: bulkDeleteIds }, ...whereKeys },
        transaction: __SQL_TRANSACTION,
      }
    );

    await Model.bulkCreate(bulkCreateObj, { transaction: __SQL_TRANSACTION });
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {where_filter}
 * @description get where filter for input array of filters
 *  */
const getFiltersFromArray = function (filters, replacableIdName) {
  const whereObj = {};
  filters.forEach(({ filter_by, filter_value, operation }) => {
    filter_by = filter_by == replacableIdName ? "id" : filter_by;
    whereObj[filter_by] = {
      [Op[operation]]: filter_value,
    };
  });
  return whereObj;
};

/**
 * @implements {calculate_discount_price}
 * @description get calculated discount price
 *  */
const getCalculatedPrice = function (price, type, value) {
  if (type == "amount") {
    return price - value;
  } else if (type == "percentage") {
    return price - (value * price) / 100;
  }
  return price;
};

const getCalculateOffset = function (price, type, value) {
  if (type == "amount") {
    return value;
  } else if (type == "percentage") {
    return (value * price) / 100;
  }
  return value;
};

const getStateId = async function (country, state) {
  try {
    const __COUNTRY = await Country.findOne({
      where: { country_name: { [Op.iLike]: country } },
    });
    if (!__COUNTRY) {
      throw "Country not found";
    }

    let __STATE = await State.findOne({
      where: { country_id: __COUNTRY.id, state_name: { [Op.iLike]: state } },
    });

    if (!__STATE) {
      state = getStateName(state, __COUNTRY.abbrevation);
      __STATE = await State.findOne({
        where: { country_id: __COUNTRY.id, state_name: { [Op.iLike]: state } },
      });
    }

    if (!__STATE) {
      throw "State not found";
    }

    return __STATE.id;
  } catch (err) {
    throw err;
  }
};

const getOrderServiceCharge = async function () {
  try {
    let __ORDER_COMMISION = await OrderServiceCharge.findOne({
      where: { status: "active" },
    });
    return __ORDER_COMMISION.toJSON();
  } catch (err) {
    throw err;
  }
};

const getDeliveryServiceCharge = async function (
  store_delivery_service,
  store_postal_code,
  user_postal_code,
  weight
) {
  try {
    const __DELIVERY_SERVICE = store_delivery_service.delivery_service;
    if (
      !(__DELIVERY_SERVICE.delivery_service_name.toLowerCase() == "delivery")
    ) {
      return {
        result: true,
        rate: 0,
      };
    } else if (!user_postal_code) {
      throw "Please add your address to proceed";
    } else {
      const { calculateShippingCost } = require("./usps.controller");
      return await calculateShippingCost(
        store_postal_code,
        user_postal_code,
        weight
      );
    }
  } catch (err) {
    throw err;
  }
};

const getStoreTax = async function (store_id) {
  try {
    const __TAX = await Tax.findOne({ where: { status: "active" } });

    if (__TAX.stripe_enabled_tax) {
      return {
        tax_type: "percentage",
        tax_value: __TAX.tax_value,
      };
    }

    const __STORE = await Store.findOne({
      where: { id: store_id },
    });

    if (__STORE.tax_value) {
      return {
        tax_type: "percentage",
        tax_value: __STORE.tax_value,
      };
    }

    return {
      tax_type: "percentage",
      tax_value: __TAX.tax_value,
    };
  } catch (err) {
    throw err;
  }
};

const getTaxRate = async function (
  from_address,
  destination_address,
  store_id,
  totalProductPrice,
  delivery_charge,
  service_charge = 0
) {
  try {
    const __TAX = await Tax.findOne({ where: { status: "active" } });

    if (!__TAX.stripe_enabled_tax) {
      return await getStoreTax(store_id);
    }

    if (!destination_address) {
      return await getStoreTax(store_id);
    }

    const state = destination_address.state.state_name;
    const country = destination_address.state.country.country_name;

    const stateAbbreviation = getStateAbbreviationByName(state, country);
    const countryAbbrevation = destination_address.state.country.abbrevation;

    const calculation = await stripe.tax.calculations.create({
      currency: "usd",
      customer_details: {
        address: {
          line1: destination_address.address_line_1,
          line2: "",
          postal_code: destination_address.postal_code,
          state: stateAbbreviation,
          country: countryAbbrevation,
        },
        address_source: "shipping",
      },
      line_items: [
        {
          amount: parseInt(totalProductPrice /*+ service_charge*/) * 100,
          tax_code: "txcd_40060003" || "txcd_32020001",
          reference: "Pepperoni Pizza",
        },
      ],
      shipping_cost: { amount: parseInt(delivery_charge) * 100 },
      expand: ["line_items"],
    });

    return {
      tax_type: "percentage",
      tax_value:
        ((parseFloat(calculation.tax_amount_exclusive) +
          parseFloat(calculation.tax_amount_inclusive)) *
          100) /
        parseFloat(calculation.amount_total),
    };
  } catch (err) {
    console.log("err=", err);
    return await getStoreTax(store_id);
  }
};

const getDefaultTax = async function () {
  try {
    const __TAX = await Tax.findOne({
      where: { status: "active" },
      attributes: {
        include: [["id", "tax_id"]],
        exclude: ["id"],
      },
    });

    return { tax: __TAX };
  } catch (err) {
    throw err;
  }
};

const updateDefaultTax = async function (data) {
  //data = {tax_value, stripe_enabled_tax}
  try {
    const { tax_value, stripe_enabled_tax } = data;

    const __TAX = await Tax.update(
      {
        tax_value,
        stripe_enabled_tax,
      },
      {
        where: { status: "active" },
      }
    );

    return {
      is_updated: true,
    };
  } catch (err) {
    throw err;
  }
};

const getUserTokens = async function (user_id) {
  try {
    const userSessions = await UserSession.findAll({
      where: {
        user_id,
        expiredAt: { [Op.gte]: moment().utc().toDate() },
        status: "active",
      },
    });

    return userSessions.map((session) => {
      return {
        device_token: session.device_token,
        device_type: session.device_type,
        user_id,
      };
    });
  } catch (err) {
    throw err;
  }
};

const getStoreMangeOrderUserIds = async function (store_id) {
  try {
    const users = [];

    const userstoreOwner = await StoreUser.findOne({
      where: { store_id, is_store_owner: true, status: "active" },
    });

    users.push(userstoreOwner.user_id);

    const manageOrderController = await Controller.findOne({
      where: { controller_key: "MANAGE_ORDER", status: "active" },
    });

    const manageOrderStoreUsers = await StoreUser.findAll({
      where: {
        store_id,
        status: "active",
      },
      include: [
        {
          model: Role,
          where: { status: "active" },
          include: [
            {
              model: Permission,
              where: {
                controller_id: manageOrderController.id,
                status: "active",
              },
            },
          ],
        },
      ],
    });

    manageOrderStoreUsers.forEach((user) => users.push(user.user_id));
    return users;
  } catch (err) {
    throw err;
  }
};

const getStoreMangeOrderUserEmails = async function (store_id) {
  try {
    const emails = [];

    const userstoreOwner = await StoreUser.findOne({
      where: { store_id, is_store_owner: true, status: "active" },
      include: [
        {
          model: User,
        },
      ],
    });

    emails.push(userstoreOwner.user.email);

    const manageOrderController = await Controller.findOne({
      where: { controller_key: "MANAGE_ORDER", status: "active" },
    });

    const manageOrderStoreUsers = await StoreUser.findAll({
      where: {
        store_id,
        status: "active",
      },
      include: [
        {
          model: Role,
          where: { status: "active" },
          include: [
            {
              model: Permission,
              where: {
                controller_id: manageOrderController.id,
                status: "active",
              },
            },
          ],
        },
        {
          model: User,
        },
      ],
    });

    manageOrderStoreUsers.forEach((su) => emails.push(su.user.email));
    return emails;
  } catch (err) {
    throw err;
  }
};

const getStoreMangeOrderUserTokens = async function (store_id) {
  try {
    const users = await getStoreMangeOrderUserIds(store_id);
    const usersSessions = await UserSession.findAll({
      where: {
        user_id: { [Op.in]: users },
        expiredAt: { [Op.gte]: moment().utc().toDate() },
        status: "active",
      },
    });

    return usersSessions.map((session) => {
      return {
        device_token: session.device_token,
        device_type: session.device_type,
        user_id: session.user_id,
      };
    });
  } catch (err) {
    // logger.err(err);
    throw err;
  }
};

const getStoreOwnerUser = async function (store_id) {
  try {
    const storeOwner = await User.findOne({
      where: { status: "active" },
      include: [
        {
          model: StoreUser,
          where: { is_store_owner: true, store_id, status: "active" },
        },
      ],
    });

    if (!storeOwner) {
      throw "Store owner not found";
    }

    return storeOwner;
  } catch (err) {
    throw err;
  }
};

const getStripePaymentService = async function () {
  try {
    const __STRIPE_PAYMENT_SERVICE = await PaymentService.findOne({
      where: { payment_service_name: { [Op.iLike]: "stripe" } },
    });

    if (!__STRIPE_PAYMENT_SERVICE) {
      throw "Stripe payment service not found";
    }

    return __STRIPE_PAYMENT_SERVICE;
  } catch (err) {
    throw err;
  }
};

const getUserCurrentBalance = async function (user_id) {
  try {
    const __USER = await User.findOne({ where: { id: user_id } });
    return __USER.user_balance;
  } catch (err) {
    throw err;
  }
};

const getStoreBalance = async function (store_id) {
  try {
    // logger.log("Store id ", store_id)
    // logger.log(store_id)
    const __STORE = await Store.findOne({ where: { id: store_id } });
    return __STORE.store_balance;
  } catch (err) {
    throw err;
  }
};

const updateStoreBalance = async function (
  store_id,
  store_balance,
  __SQL_TRANSACTION
) {
  try {
    return await Store.update(
      { store_balance },
      { where: { id: store_id }, transaction: __SQL_TRANSACTION }
    );
  } catch (err) {
    throw err;
  }
};

const updateUserBalance = async function (
  user_id,
  user_balance,
  __SQL_TRANSACTION
) {
  try {
    return await User.update(
      { user_balance },
      { where: { id: user_id }, transaction: __SQL_TRANSACTION }
    );
  } catch (err) {
    throw err;
  }
};

const getStoreServiceCharge = async function (store_id) {
  try {
    const __STORE_SERVICE_CHARGE = await StoreServiceCharge.findOne({
      where: { store_id, status: "active" },
      attributes: ["service_charge_type", "service_charge_value", "store_id"],
    });

    if (!__STORE_SERVICE_CHARGE) {
      const __DEFAULT_SERVICE_CHARGE = await StoreServiceCharge.findOne({
        where: { store_id: null, status: "active" },
        attributes: ["service_charge_type", "service_charge_value", "store_id"],
      });

      if (!__DEFAULT_SERVICE_CHARGE) {
        throw "Service charge is unavailable";
      }

      return __DEFAULT_SERVICE_CHARGE;
    }

    return __STORE_SERVICE_CHARGE;
  } catch (err) {
    throw err;
  }
};

const getStripeTransferPaymentService = async function () {
  try {
    const __PAYMENT_SERVICE = await PaymentService.findOne({
      where: {
        payment_service_name: { [Op.iLike]: "Stripe transfer" },
        is_enabled: true,
        status: "active",
      },
    });

    if (!__PAYMENT_SERVICE) {
      throw "Payment service is unavailable";
    }

    return __PAYMENT_SERVICE;
  } catch (err) {
    throw err;
  }
};

const isOpenForNotification = async function (
  user_id,
  is_for_store = false,
  notification_type
) {
  try {
    const __NOTIFICATION_SETTING = await NotificationSetting.findOne({
      where: {
        user_id,
        is_for_store,
        notification_type,
        status: "active",
      },
    });

    if (!__NOTIFICATION_SETTING) {
      return false;
    }
    return __NOTIFICATION_SETTING.is_enabled;
  } catch (err) {
    throw err;
  }
};

const getPageHtml = function (title, body) {
  try {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <base href="/" />

                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link
                    rel="icon"
                    type="image/x-icon"
                    href="favicon.ico"
                    crossorigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700"
                    rel="stylesheet"
                    crossorigin="anonymous"
                />
                    <link rel="preconnect" href="https://fonts.gstatic.com">
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            </head>
            <body class="mat-typography">
                ${body}
            </body>
        </html>

        `;
  } catch (err) {
    throw err;
  }
};

function getStateAbbreviationByName(stateName, countryName) {
  try {
    const country = iso3166.country(countryName);
    if (country) {
      for (const stateId in country.sub) {
        const sName = country.sub[stateId].name;
        if (sName.toLowerCase() == stateName.toLowerCase()) {
          if (stateId.includes("-")) {
            return stateId.split("-")[stateId.split("-").length - 1];
          }
          return stateId;
        }
      }
    }
    throw "Delivery is unavailable in this state";
  } catch (err) {
    throw err;
  }
}

function getStateName(stateAbbreviation, countryCode) {
  // Get the country object by name

  // Get the state object by abbreviation and country code
  const state = csc.State.getStatesOfCountry(countryCode).find((s) => {
    return s.isoCode == stateAbbreviation;
  });

  if (!state) {
    throw `State abbreviation "${stateAbbreviation}" not found`;
  }

  return state.name;
}

const createXLSXfile = function (files) {
  try {
    const workbook = XLSX.utils.book_new();

    for (let i = 0; i < files.length; i++) {
      const fileds = [];
      const file = files[i];
      const data = file.data;
      for (const col in data[0]) {
        fileds.push(col);
      }

      const worksheet = XLSX.utils.aoa_to_sheet([
        fileds,
        ...data
          .filter((d, i) => i >= 0)
          .map((d) => {
            const val = [];
            for (let key in d) {
              val.push(d[key]);
            }
            return val;
          }),
      ]);

      XLSX.utils.book_append_sheet(workbook, worksheet, file.sheetName);
    }

    const fileBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return fileBuffer;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  upsert,
  getControllerByControllerKey,
  getControllerById,
  isUserVerified,
  getPaginationResult,
  checkStoreStatus,
  getCalculatedPrice,
  bulkCreateUpdateDelete,
  isUserBelongsToStore,
  getFiltersFromArray,
  getOrderServiceCharge,
  getStoreBalance,
  getStoreServiceCharge,
  getDeliveryServiceCharge,
  getTaxRate,
  getCalculateOffset,
  getUserTokens,
  getStoreMangeOrderUserTokens,
  getStoreOwnerUser,
  getStripePaymentService,
  getUserCurrentBalance,
  getStateId,
  getStripeTransferPaymentService,
  getStoreMangeOrderUserIds,
  isOpenForNotification,
  getStoreMangeOrderUserEmails,
  getFullResult,
  updateStoreBalance,
  updateUserBalance,

  getPageHtml,
  getStateAbbreviationByName,
  createXLSXfile,
  getDefaultTax,
  updateDefaultTax,
};
