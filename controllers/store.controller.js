require("custom-env").config(true);

const { Sequelize, where, Op } = require("sequelize");
const moment = require("moment");
const sequelize = global["sequelize"];
const ExcelJS = require("exceljs");

const FavouriteStore = require("../models/store/favourite_stores.model");
const Store = require("../models/store/store.model");
const StoreUser = require("../models/store/store_users.model");
const MESSAGES = require("../utils/messages.util");
const SnsController = require("./sns.controller");
const User = require("../models/user/user.model");
const CommonController = require("./common.controller");
const HELPERS = require("../utils/helper.utils");
const Role = require("../models/store/role.model");
const Permission = require("../models/store/permission.model");
const StoreUserRole = require("../models/store/store_user_role.model");
const Module = require("../models/module/module.model");
const Controller = require("../models/module/controller.model");
const IrsController = require("./irs.controller");
const StoreAddress = require("../models/store/store_address.model");
const S3Controller = require("./s3.controller");
const State = require("../models/state/state.model");
const Country = require("../models/state/country.model");
const StoreTiming = require("../models/store/store_timings.model");
const StoreUserTiming = require("../models/store/store_user_timing.model");
const UserAddress = require("../models/user/user_address.model");
const Product = require("../models/catalogue/product.model");
const DeliveryService = require("../models/delivery/delivery_service.model");
const StoreDeliveryService = require("../models/delivery/store_delivery_service.model");
const logger = require("../logger/logger");
const Order = require("../models/order/order.model");
const ClaimStore = require("../models/store/claim_store.model");
const StorePage = require("../models/store/store_page.model");
const StoreVisitor = require("../models/store/store_visitor.model");
const AdminNotification = require("../models/notification/admin_notification.model");
const StoreServiceCharge = require("../models/store/store_service_charge.model");
const USPSController = require("./usps.controller");
const PreviousStore = require("../models/store/previous_store.model");
const { cliamStore_Template } = require("../config/email_templates.config");
const Tax = require("../models/tax/tax.model");
const DefaultRole = require("../models/module/default_role.model");
const DefaultPermission = require("../models/module/default_permission.model");
const { required } = require("joi");

const listDeliveryServices = async function () {
  try {
    const __DELIVERY_SERVICES = await DeliveryService.findAll({
      where: { is_enabled: true, status: "active" },
      attributes: [["id", "delivery_service_id"], "delivery_service_name"],
    });

    return { delivery_services: __DELIVERY_SERVICES };
  } catch (err) {
    throw err;
  }
};

const saveStorePage = async function (data) {
  // data = {store_id, store_page_type, store_page_content}
  try {
    const { store_id, store_page_type, store_page_content } = data;

    const __PAGE = await StorePage.findOne({
      where: { store_id, store_page_type },
    });

    if (__PAGE) {
      await StorePage.update(
        { store_page_content },
        { where: { id: __PAGE.id } }
      );
    } else {
      await StorePage.create({
        store_id,
        store_page_type,
        store_page_content,
        status: "active",
      });
    }

    return { is_saved: true };
  } catch (err) {
    throw err;
  }
};

const getStorePageDetails = async function (data) {
  // data = {store_id, store_page_type}
  try {
    const { store_id, store_page_type } = data;

    const __PAGE = await StorePage.findOne({
      where: { store_id, store_page_type },
      attributes: [
        ["id", "store_page_id"],
        "store_id",
        "store_page_type",
        "store_page_content",
      ],
    });
    return { page: __PAGE };
  } catch (err) {
    throw err;
  }
};

const listStorePages = async function (store_id) {
  try {
    const __PAGES = await StorePage.findAll({
      where: { store_id },
      attributes: [
        ["id", "store_page_id"],
        "store_id",
        "store_page_type",
        "store_page_content",
      ],
    });

    return __PAGES;
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store}
 * @description create store and store_owner
 *  */
const createStore = async function (data, user = null) {
  // data = {store, store_address, store_timings, is_24_hours_active, store_delivery_services, store_pages}

  // store = {store_name, store_ein, image_url, store_nick_name,
  // store_email, store_phone, store_phone_code, is_verified, is_enabled}

  // store_address {country, state, address_name, longitude, latitude,
  // address_line_1, address_line_2, landmark, city}

  // store_timings = [{is_24_hours_active, day_of_week, opening_time, closing_time}]

  // store_delivery_services = [{delivery_service_id, is_enabled}]

  // store_pages = [{store_page_type, store_page_content}]

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    let {
      store,
      store_address,
      store_timings,
      is_24_hours_active,
      store_delivery_services,
      store_pages,
    } = data;

    if (store_delivery_services.length == 0 && user) {
      throw "Please select atleast one delivery service";
    }

    let tax_value = store.tax_value;

    if (!tax_value) {
      const __TAX = await CommonController.getDefaultTax();
      tax_value = __TAX.tax.tax_value;
    }

    const verifyStore = await IrsController.verifyStoreEin(store);
    const __STORE = await Store.create(
      {
        store_name: store.store_name,
        store_ein: store.store_ein,
        image_url: store.image_url,
        logo_url: store.logo_url,
        store_nick_name: store.store_nick_name,
        store_email: store.store_email,
        store_phone: store.store_phone,
        store_phone_code: store.store_phone_code,
        is_verified: user ? true : false,
        verified_by: user ? "store_owner" : null,
        is_enabled: true,
        status: "active",
        store_balance: 0,
        tax_value,
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );
    if (user) {
      const storeOwner = await StoreUser.create(
        {
          store_id: __STORE.id,
          user_id: user.id,
          is_store_owner: true,
          is_verified: true,
          verifiedAt: moment().utc().toDate(),
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    const state_id = await CommonController.getStateId(
      store_address.country,
      store_address.state
    );

    const __STORE__ADDRESS = await StoreAddress.create(
      {
        store_id: __STORE.id,
        state_id: state_id,
        address_name: store_address.address_name,
        longitude: store_address.longitude,
        latitude: store_address.latitude,
        address_line_1: store_address.address_line_1,
        address_line_2: store_address.address_line_2,
        landmark: store_address.landmark,
        city: store_address.city,
        postal_code: store_address.postal_code,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    if (is_24_hours_active) {
      store_timings = [];
      for (let i = 1; i < 8; i++) {
        store_timings.push({
          store_id: __STORE.id,
          is_24_hours_active: true,
          day_of_week: i,
          opening_time: "00:00:00",
          closing_time: "23:59:59",
          status: "active",
        });
      }
    }

    const __STORE_TIMINGS = await StoreTiming.bulkCreate(
      store_timings
        .map((timing) => {
          return { ...timing, store_id: __STORE.id, status: "active" };
        })
        .filter((timing) => timing.day_of_week >= 1 && timing.day_of_week <= 7),
      { transaction: __SQL_TRANSACTION }
    );

    const __STORE_DELIVERY_SERVICES = await StoreDeliveryService.bulkCreate(
      store_delivery_services.map((service) => {
        return { ...service, store_id: __STORE.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    if (store_pages) {
      const __STORE_PAGES = await StorePage.bulkCreate(
        store_pages.map((sp) => {
          return {
            ...sp,
            store_id: __STORE.id,
            status: "active",
          };
        }),
        { transaction: __SQL_TRANSACTION }
      );
    }

    if (user) {
      const __ADMIN_NOTIFICATION = await AdminNotification.create(
        {
          store_id: __STORE.id,
          is_read: false,
          title: `New store added with ${store.store_name}`,
          message: `New store added with ${store.store_name}`,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    const __DEFAULT_ROLES_PERMISSIONS = await DefaultRole.findAll({
      where: { status: "active" },
      include: [
        {
          model: DefaultPermission,
          required: false,
          where: { status: "active" },
        },
      ],
    });

    for (let i = 0; i < __DEFAULT_ROLES_PERMISSIONS.length; i++) {
      const defaultRole = __DEFAULT_ROLES_PERMISSIONS[i];
      const __ROLE = await Role.create(
        {
          role_name: defaultRole.role_name,
          store_id: __STORE.id,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
      await Permission.bulkCreate(
        defaultRole.default_permissions.map((defaultPermission) => {
          return {
            controller_id: defaultPermission.controller_id,
            role_id: __ROLE.id,
            status: "active",
          };
        }),
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    await __SQL_TRANSACTION.commit();
    return { store_id: __STORE.id, store_address_id: __STORE__ADDRESS.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

/**
 * @implements {store}
 * @description get store details
 *  */
const getStoreDetails = async function (
  store_id,
  user_id = null,
  is_admin_requested = null
) {
  try {
    const favouriteStore = user_id
      ? [
          {
            model: FavouriteStore,
            required: false,
            where: { user_id, status: "active" },
          },
        ]
      : [];

    const hasStoreOnwer = is_admin_requested
      ? [
          {
            model: StoreUser,
            where: { is_store_owner: true },
            required: false,
          },
        ]
      : [];

    const __STORE = await Store.findOne({
      where: { id: store_id },
      attributes: [
        ["id", "store_id"],
        "store_name",
        "store_ein",
        "image_url",
        "logo_url",
        "store_nick_name",
        "store_phone_code",
        "store_email",
        "store_phone",
        "is_verified",
        "is_enabled",
        "dynamic_link",
        "tax_value",
      ],
      required: false,
      include: [
        {
          model: StoreAddress,
          required: false,

          attributes: [
            ["id", "store_address_id"],
            "address_name",
            "longitude",
            "latitude",
            "address_line_1",
            "address_line_2",
            "landmark",
            "city",
            "postal_code",
          ],
          include: [
            {
              model: State,
              required: true,
              attributes: [["id", "state_id"], "state_name"],
              include: [
                {
                  model: Country,
                  required: true,
                  attributes: [["id", "country_id"], "country_name"],
                },
              ],
            },
          ],
        },
        {
          model: StoreTiming,
          attributes: [
            ["id", "store_timing_id"],
            "is_24_hours_active",
            "day_of_week",
            "opening_time",
            "closing_time",
            "status",
          ],
          required: false,
          where: { status: "active" },
        },
        {
          model: StoreDeliveryService,
          required: false,
          where: { status: "active" },
          attributes: [
            ["id", "store_delivery_service_id"],
            "delivery_service_id",
            "is_enabled",
            "status",
          ],
        },
        {
          model: StorePage,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_page_id"]],
            exclude: ["id"],
          },
        },
        ...favouriteStore,
        ...hasStoreOnwer,
      ],
    });

    if (!__STORE) {
      throw MESSAGES.STORE_UNAVAILABLE;
    }

    // return __STORE;
    const isFavouriteStore = user_id
      ? {
          is_favourite_store: __STORE.favourite_stores.length ? true : false,
        }
      : {};

    var store = Object.assign(
      {
        image: S3Controller.getAwsS3SignedFileUrl(__STORE.image_url),
        logo: S3Controller.getAwsS3SignedFileUrl(__STORE.logo_url),
        ...isFavouriteStore,
      },
      __STORE.toJSON()
    );

    store.store_pages = store.store_pages.map((page) => {
      return {
        ...page,
        store_page_content: S3Controller.getAwsS3SignedFileUrl(
          page.store_page_content
        ),
      };
    });

    if (is_admin_requested) {
      store.has_store_owner = store.store_users ? true : false;
    }

    delete store["image_url"];
    delete store["logo_url"];
    delete store.favourite_stores;
    delete store.store_users;
    return { store };
  } catch (err) {
    console.log("errorr", err);
    throw err;
  }
};

/**
 * @implements {store}
 * @description edit store details
 *  */
const editStoreDetails = async function (data) {
  const __SQL_TRANSACTION = await sequelize.transaction();
  // data = {store_id, store, store_address, store_timings, is_24_hours_active, store_delivery_services, store_pages}

  // store = {store_name, store_ein, image_url, store_nick_name,
  // store_email, store_phone, store_phone_code, is_enabled}

  // store_address { store_address_id, country, state, address_name, longitude, latitude,
  // address_line_1, address_line_2, landmark, city}

  // store_timings = [{is_24_hours_active, day_of_week, opening_time, closing_time}]

  // store_delivery_services = [{store_delivery_service_id, delivery_service_id, is_enabled, status}]

  // store_pages = [{store_page_type, store_page_content}]

  try {
    let {
      store_id,
      store,
      store_address,
      store_timings,
      is_24_hours_active,
      store_delivery_services,
      store_pages,
    } = data;
    const {
      store_name,
      store_ein,
      image_url,
      logo_url,
      store_nick_name,
      store_email,
      store_phone,
      store_phone_code,
      is_enabled,
    } = store;
    const {
      store_address_id,
      country,
      state,
      address_name,
      longitude,
      latitude,
      address_line_1,
      address_line_2,
      landmark,
      city,
      postal_code,
    } = store_address;

    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });

    if (!__STORE) {
      throw MESSAGES.STORE_UNAVAILABLE;
    }

    let is_verified = __STORE.is_verified;
    if (__STORE.store_ein != store_ein) {
      is_verified = await IrsController.verifyStoreEin(store);
    }

    let tax_value = store.tax_value;

    if (!tax_value) {
      const __TAX = await CommonController.getDefaultTax();
      tax_value = __TAX.tax.tax_value;
    }

    const __UPDATE_STORE = await Store.update(
      {
        store_name,
        store_ein,
        image_url,
        logo_url,
        store_nick_name,
        store_email,
        store_phone,
        store_phone_code,
        is_enabled,
        is_verified,
        tax_value,
      },
      {
        where: { id: store_id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const state_id = await CommonController.getStateId(
      store_address.country,
      store_address.state
    );

    const __UPDATE_STORE_ADDRESS = await StoreAddress.update(
      {
        state_id,
        address_name,
        longitude,
        latitude,
        address_line_1,
        address_line_2,
        landmark,
        city,
        postal_code,
      },
      {
        where: { id: store_address_id, store_id, status: "active" },
        transaction: __SQL_TRANSACTION,
      }
    );

    if (is_24_hours_active) {
      store_timings = [];
      const __OLD_STORE_TIMINGS = await StoreTiming.findAll({
        where: { store_id, status: "active" },
        attributes: [
          ["id", "store_timing_id"],
          "is_24_hours_active",
          "day_of_week",
          "opening_time",
          "closing_time",
          "status",
        ],
      });

      __OLD_STORE_TIMINGS.map((timing) => {
        if (timing.is_24_hours_active) {
          store_timings.push(timing.toJSON());
        } else {
          const tempTiming = timing.toJSON();
          tempTiming.status = "deleted";
          store_timings.push(tempTiming);
        }
      });

      for (let i = 1; i < 8; i++) {
        const isTimingAvaiabled = store_timings.find((timing) => {
          return timing.day_of_week == i && timing.status == "active";
        });

        if (!isTimingAvaiabled) {
          store_timings.push({
            store_timing_id: null,
            is_24_hours_active: true,
            day_of_week: i,
            opening_time: "00:00:00",
            closing_time: "23:59:59",
            status: "active",
          });
        }
      }
    }

    await CommonController.bulkCreateUpdateDelete(
      StoreTiming,
      store_timings.map((timing) => {
        return { ...timing, store_id };
      }),
      "store_timing_id",
      { store_id },
      __SQL_TRANSACTION
    );

    await CommonController.bulkCreateUpdateDelete(
      StoreDeliveryService,
      store_delivery_services.map((service) => {
        return { ...service, store_id };
      }),
      "store_delivery_service_id",
      { store_id },
      __SQL_TRANSACTION
    );

    if (store_pages) {
      for (let i = 0; i < store_pages.length; i++) {
        const sp = store_pages[i];
        await saveStorePage({
          ...sp,
          store_id,
        });
      }
    }

    await __SQL_TRANSACTION.commit();
    return { is_updated: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const updateStoreDynamicLink = async function (data) {
  // data = {store_id, dynamic_link}
  try {
    const { store_id, dynamic_link } = data;
    await Store.update({ dynamic_link }, { where: { id: store_id } });
    return { is_updated: true };
  } catch (err) {
    throw err;
  }
};

const deleteStore = async function (store_id) {
  try {
    const OrderController = require("./order.controller"); // to prevent this from recursion

    const storeActiveOrders = await OrderController.listStoreOrders({
      page: 1,
      page_size: 10,
      order_by: "order_id",
      order_type: "DESC",
      only_active_orders: true,
      from_date: null,
      to_date: null,
      store_id,
    });

    if (storeActiveOrders?.orders?.length > 0) {
      throw "Could not delete store as there are orders in progress.";
    }

    const __DELETE_STORE = await Store.update(
      { status: "deleted" },
      { where: { id: store_id, status: "active" } }
    );

    if (!__DELETE_STORE[0]) {
      throw "Something went wrong";
    }

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {user_stores}
 * @description get user stores
 *  */
const getUserStores = async function (user_id) {
  const order = [["id", "DESC"]];
  const __STORE_USERS = await StoreUser.findAll({
    where: { user_id, status: "active" },
    order: order,
    include: [
      {
        model: StoreUserTiming,
        required: false,
        where: { status: "active" },
        attributes: [
          ["id", "store_user_timing_id"],
          "is_24_hrs_active",
          "day_of_week",
          "start_time",
          "end_time",
          "status",
        ],
      },
    ],
  });

  const __STORES = await Store.findAll({
    attributes: ["id", "store_name", "store_ein", "image_url", "logo_url"],
    where: {
      id: { [Op.in]: __STORE_USERS.map((user) => user.store_id) },
      status: "active",
    },
    include: [
      {
        model: StoreAddress,
        where: { status: "active" },
        required: false,
        attributes: [
          ["id", "store_address_id"],
          "address_name",
          "longitude",
          "latitude",
          "address_line_1",
          "address_line_2",
          "landmark",
          "city",
        ],
        include: [
          {
            model: State,
            attributes: [["id", "state_id"], "state_name"],
          },
        ],
      },
    ],
  });

  return {
    stores: __STORES.map((store, index) => {
      store = store.toJSON();
      const store_id = store.id;
      const image = S3Controller.getAwsS3SignedFileUrl(store.image_url);
      const logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
      delete store.id;
      delete store.image_url;
      delete store.logo_url;

      if (index == __STORES.length - 1) {
        store.is_primary_store = true;
      } else {
        store.is_primary_store = false;
      }

      return { store_id, image, logo, ...store };
    }),
  };
};

const getStoreOwnerStores = async function (user_id) {
  try {
    const __STORES = await Store.findAll({
      where: { status: "active" },
      attributes: {
        include: [["id", "store_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: StoreUser,
          where: { user_id, is_store_owner: true, status: "active" },
          attributes: [],
        },
      ],
    });

    return __STORES;
  } catch (err) {
    throw err;
  }
};

const getStoresWithManageOrderPermissions = async function (user_id) {
  try {
    const stores = await getStorePermissions(user_id);
    return {
      stores: stores.stores
        .map((store) => {
          return {
            store_id: store.controllers.find(
              (c) => c.controller_key == "MANAGE_ORDER"
            )
              ? store.store_id
              : null,
          };
        })
        .filter((s) => s.store_id),
    };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_user}
 * @description create store user
 *  */
const createStoreUser = async function (data) {
  // data = { store_id, employee_name, description, phone, phone_code, email, employee_timings, role_id}
  // employee_timings = [{day_of_week, is_24_hrs_active, start_time, end_time}]
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const {
      store_id,
      employee_name,
      image_url,
      description,
      phone,
      phone_code,
      email,
      employee_timings,
      role_id,
    } = data;
    let __USER = await User.findOne({
      where: { phone, phone_code, status: "active", is_account_deleted: false },
    });
    if (!__USER) {
      __USER = await User.create(
        {
          first_name: employee_name,
          email,
          image_url,
          phone,
          phone_code,
          status: "active",
          has_store_access: true,
          is_account_deleted: false,
          user_balance: 0,
        },
        { transaction: __SQL_TRANSACTION }
      );
      if (!__USER) {
        throw "Invalid user parameters";
      }
    }

    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });

    if (!__STORE) {
      throw MESSAGES.STORE_UNAVAILABLE;
    }

    const verification_code = HELPERS.getRandomVerificationCode();

    const __IS_STORE_USER_EXISTS = await StoreUser.findOne({
      where: { user_id: __USER.id, store_id, status: "active" },
    });

    if (__IS_STORE_USER_EXISTS) {
      if (__IS_STORE_USER_EXISTS.is_store_owner) {
        throw "Can not add store owner as worker";
      }

      if (__IS_STORE_USER_EXISTS.is_verified) {
        throw "Worker already exists";
      }

      // const __DELETE_OLD_VERIFICATION = await StoreUser.update({
      //     status: 'deleted'
      // },{
      //     where: {id: __IS_STORE_USER_EXISTS.id},
      // })
    }

    const __STORE_USER = await StoreUser.create(
      {
        user_id: __USER.id,
        store_id,
        role_id: role_id ? role_id : null,
        description,
        is_verified: true,
        verification_code,
        is_store_owner: false,
        verificationExpiredAt: moment().utc().add(7, "days").toDate(),
        status: "active",
        verifiedAt: moment().utc().toDate(),
      },
      { transaction: __SQL_TRANSACTION }
    );
    const __EMPLOYEE_TIMINGS = await StoreUserTiming.bulkCreate(
      employee_timings.map((timing) => {
        return { ...timing, store_user_id: __STORE_USER.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    if (__USER) {
      await User.update(
        { has_store_access: true },
        { where: { id: __USER.id } }
      );
    }

    // await SnsController.sendStoreUserEmail(__USER, __STORE, verification_code, __STORE_USER.id);
    await __SQL_TRANSACTION.commit();

    return { store_user_id: __STORE_USER.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    if (err.name == MESSAGES.EXCEPTION_NAME_SEQUALIZE_UNIQUE_CONSTRAINT) {
      throw MESSAGES.STORE_USER_ALREADY_EXISTS;
    }
    throw err;
  }
};

/**
 * @implements {verify_store_user}
 * @description verify the store user
 *  */
const verifyStoreUser = async function (store_user_id, verification_code) {
  // data = {store_user_id, verification_code}
  try {
    const __STORE_USER = await StoreUser.findOne({
      where: { id: store_user_id, status: "active" },
      include: [
        {
          model: User,
        },
      ],
    });

    if (!__STORE_USER) {
      throw MESSAGES.STORE_USER_NOT_FOUND;
    }

    const currentDate = moment().utc();
    const verificationExpiredAt = moment(
      __STORE_USER.verificationExpiredAt
    ).utc();

    if (currentDate.isAfter(verificationExpiredAt)) {
      throw MESSAGES.STORE_USER_VERIFICATION_CODE_EXPIRED;
    }

    if (__STORE_USER.verification_code != verification_code) {
      throw MESSAGES.STORE_USER_VERIFICATION_CODE_NOT_MATCHES;
    }

    if (!__STORE_USER.user.has_store_access) {
      await User.update(
        { has_store_access: true },
        { where: { id: __STORE_USER.user.id } }
      );
    }

    const __VERIFY_STORE_USER = await StoreUser.update(
      {
        is_verified: true,
        verifiedAt: moment().utc().toDate(),
      },
      {
        where: { id: store_user_id },
      }
    );
    return __VERIFY_STORE_USER;
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_user_details}
 * @description get the store user details
 *  */
const getStoreUser = async function (data, user) {
  // data = {store_id}
  try {
    const { store_id } = data;
    const __STORE_USER = await StoreUser.findOne({
      where: {
        store_id: store_id,
        user_id: user.id,
        is_verified: true,
        status: "active",
      },
      attributes: [
        ["id", "store_user_id"],
        "user_id",
        "store_id",
        "is_store_owner",
        "description",
      ],
      required: false,
      include: [
        {
          model: Role,
          required: false,
          where: { status: "active" },
          attributes: [["id", "role_id"], "role_name"],
          include: [
            {
              model: Permission,
              required: false,
              where: { status: "active" },
              attributes: [["id", "permission_id"]],
              include: [
                {
                  model: Controller,
                  where: { status: "active" },
                  attributes: [
                    ["id", "controller_id"],
                    "controller_key",
                    "controller_name",
                    "controller_description",
                  ],
                },
              ],
            },
          ],
        },
        {
          model: StoreUserTiming,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "store_user_timing_id"],
            "day_of_week",
            "is_24_hrs_active",
            "start_time",
            "end_time",
            "status",
          ],
        },
        {
          model: User,
          status: { status: "active" },
          required: false,
          attributes: [
            ["id", "user_id"],
            "email",
            "phone",
            "phone",
            "phone_code",
            "first_name",
            "last_name",
            "image_url",
          ],
        },
      ],
    });

    if (!__STORE_USER) {
      throw MESSAGES.STORE_USER_NOT_BELONGS_TO_STORE;
    }

    const storeUser = __STORE_USER.toJSON();
    const image = S3Controller.getAwsS3SignedFileUrl(storeUser.user.image_url);
    delete storeUser.user.image_url;
    storeUser.user.image = image;

    return { store_user: storeUser };
  } catch (err) {
    throw err;
  }
};

const getStoreUserDetailsByStoreUser = async function (data) {
  // data = {store_id, store_user_id}
  try {
    const { store_id, store_user_id } = data;
    const __STORE_USER = await StoreUser.findOne({
      where: { id: store_user_id, store_id, status: "active" },
      include: [
        {
          model: User,
          where: { status: "active" },
        },
      ],
    });
    if (!__STORE_USER) {
      throw MESSAGES.STORE_USER_NOT_FOUND;
    }

    return await getStoreUser(data, __STORE_USER.user);
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_user_details}
 * @description edit store user details
 *  */
const editStoreUserDetails = async function (data) {
  // data = { store_id, store_user_id, description, employee_timings, role_id, first_name, last_name}
  // employee_timings = [{store_user_timing_id, day_of_week, is_24_hrs_active, start_time, end_time, status}]
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const {
      store_id,
      store_user_id,
      description,
      employee_timings,
      role_id,
      first_name,
      last_name,
    } = data;

    const __STORE_WORKER = await User.findOne({
      include: [
        {
          model: StoreUser,
          where: { id: store_user_id },
        },
      ],
    });

    if (!__STORE_WORKER) {
      throw "Store worker not found";
    }

    await User.update(
      { first_name, last_name },
      {
        where: { id: __STORE_WORKER.id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __STORE_USER = await StoreUser.update(
      { description, role_id: role_id ? role_id : null },
      {
        where: { id: store_user_id, store_id, status: "active" },
        transaction: __SQL_TRANSACTION,
      }
    );

    await CommonController.bulkCreateUpdateDelete(
      StoreUserTiming,
      employee_timings.map((eTiming) => {
        return { ...eTiming, store_user_id };
      }),
      "store_user_timing_id",
      { store_user_id },
      __SQL_TRANSACTION
    );

    await __SQL_TRANSACTION.commit();
    return { is_update: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

/**
 * @implements {store_user_delete}
 * @description delete the store user
 *  */
const deleteStoreUser = async function (data) {
  try {
    // data = {store_id, store_user_id}
    const { store_id, store_user_id } = data;
    const deleteUser = await StoreUser.update(
      {
        status: "deleted",
      },
      {
        where: {
          store_id: store_id,
          id: store_user_id,
          is_store_owner: { [Op.ne]: true },
        },
      }
    );

    if (!deleteUser[0]) {
      throw MESSAGES.STORE_USER_NOT_DELETED;
    }

    return { is_deleted: deleteUser[0] };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_user_list}
 * @description get the users list of the store
 *  */
const getStoreUserList = async function (data) {
  // data = { store_id, order_by, order_type }
  try {
    const { store_id, order_by, order_type } = data;
    const order = [
      order_by && order_type ? [order_by, order_type] : ["id", "ASC"],
    ];

    const query = {
      where: {
        store_id: store_id,
        is_store_owner: false,
        is_verified: true,
        status: "active",
      },
      attributes: [
        ["id", "store_user_id"],
        "is_store_owner",
        "is_verified",
        "verifiedAt",
      ],
      include: [
        {
          model: User,
          required: true,
          attributes: [
            ["id", "user_id"],
            "email",
            "phone",
            "image_url",
            "first_name",
            "last_name",
          ],
          where: { status: "active" },
          include: [
            {
              model: UserAddress,
              required: false,
              where: { status: "active" },
              attributes: [
                ["id", "user_address_id"],
                "address_name",
                "address_line_1",
                "address_line_2",
                "city",
                "postal_code",
              ],
            },
          ],
        },
        {
          model: Role,
          required: false,
          attributes: [["id", "role_id"], "role_name"],
          where: { status: "active" },
        },
        {
          model: StoreUserTiming,
          required: false,
          where: { status: "active" },
          attributes: [
            ["id", "store_user_timing_id"],
            "day_of_week",
            "is_24_hrs_active",
            "start_time",
            "end_time",
            "status",
          ],
        },
      ],
    };

    const __USERS__ = await StoreUser.findAndCountAll({
      distinct: true,
      ...query,
      order,
    });

    const users = __USERS__.rows.map((user) => {
      user = user.toJSON();
      const image = S3Controller.getAwsS3SignedFileUrl(user.user.image_url);
      delete user.user.image_url;
      user.user.image = image;
      return user;
    });

    return { total_count: __USERS__.count, store_users: users };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_roles}
 * @description create roles for the store
 *  */
const createStoreRole = async function (data) {
  // data = {store_id, role_name, permissions}
  // permissions = [{controller_id}]
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, role_name, permissions } = data;
    let role = await Role.create(
      { store_id, role_name, status: "active" },
      { transaction: __SQL_TRANSACTION }
    );

    const __PERMISSIONS = await Permission.bulkCreate(
      permissions.map((p) => {
        return { ...p, role_id: role.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    await __SQL_TRANSACTION.commit();
    return {
      role_id: role.id,
    };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    if (err.name == MESSAGES.EXCEPTION_NAME_SEQUALIZE_UNIQUE_CONSTRAINT) {
      throw MESSAGES.STORE_ROLE_ALREADY_EXISTS;
    }
    throw err;
  }
};

/**
 * @implements {store_roles}
 * @description get roles of the store
 *  */
const listStoreRoles = async function (store_id) {
  try {
    const __ROLES__ = await Role.findAll({
      where: { store_id, status: "active" },
    });
    return {
      store_roles: __ROLES__.map((role) => {
        return { role_id: role.id, role_name: role.role_name };
      }),
    };
  } catch (err) {
    throw MESSAGES.SOMETHING_WENT_WRONG;
  }
};

/**
 * @implements {store_roles}
 * @description get role of the store
 *  */
const getStoreRole = async function (data) {
  // data = {store_id, role_id}
  try {
    let constrolerrr = await Controller.findAll({
      where: { status: "active" },
    });
    let allPermission = await Permission.findAll({
      where: { status: "active" },
    });
    const { store_id, role_id } = data;
    const __ROLE = await Role.findOne({
      where: { id: role_id, store_id, status: "active" },
      attributes: [["id", "role_id"], "role_name"],
      include: [
        {
          model: Permission,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "permission_id"],
            "controller_id",
            "role_id",
            "status",
          ],
          include: [
            {
              model: Controller,
              where: { status: "active", only_store_owner_accessible: false },
              attributes: [
                "controller_key",
                "controller_name",
                "controller_description",
              ],
            },
          ],
        },
      ],
    });
    return { role: __ROLE, allPermission: allPermission };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {store_roles}
 * @description edit role of the store
 *  */
const editStoreRole = async function (data) {
  // data = { store_id, role_id, role_name, permissions}
  // permissions = [{permission_id,controller_id, status}]
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, role_id, role_name, permissions } = data;
    const __ROLE = await Role.update(
      { role_name },
      {
        where: { id: role_id, store_id, status: "active" },
        transaction: __SQL_TRANSACTION,
      }
    );

    await CommonController.bulkCreateUpdateDelete(
      Permission,
      permissions.map((permission) => {
        return { ...permission, role_id };
      }),
      "permission_id",
      { role_id },
      __SQL_TRANSACTION
    );

    await __SQL_TRANSACTION.commit();
    return { is_update: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

/**
 * @implements {store_roles}
 * @description delete the store role
 *  */
const deleteStoreRole = async function (data) {
  // data = {store_id, role_id}
  try {
    const { store_id, role_id } = data;
    const deleteRole = await Role.update(
      {
        status: "deleted",
      },
      {
        where: {
          id: role_id,
          store_id: store_id,
        },
      }
    );

    if (!deleteRole[0]) {
      throw MESSAGES.STORE_ROLE_NOT_DELETED;
    }

    return {
      is_deleted: deleteRole[0],
    };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {controllers}
 * @description get roles of the store
 *  */
const getAllControllers = async function () {
  try {
    const controllers = await Module.findAll({
      where: { status: "active" },
      order: [
        ["module_id", "ASC"],
        [sequelize.col("controllers.id"), "ASC"],
      ],
      attributes: [["id", "module_id"], "module_name", "module_key"],
      include: [
        {
          model: Controller,
          attributes: [
            ["id", "controller_id"],
            "controller_name",
            "controller_key",
            "controller_description",
          ],
          where: { only_store_owner_accessible: false, status: "active" },
        },
      ],
    });
    return { modules: controllers };
  } catch (err) {
    throw err;
  }
};

const getStorePermissions = async function (user_id) {
  try {
    const __CONTROLLERS = await Controller.findAll({
      where: { status: "active" },
      attributes: [
        ["id", "controller_id"],
        "controller_key",
        "controller_name",
      ],
    });

    const __STORES = await Store.findAll({
      where: { status: "active" },
      attributes: [["id", "store_id"], "store_name"],
      include: [
        {
          model: StoreUser,
          where: { user_id, status: "active" },
          include: [
            {
              model: Role,
              required: false,
              where: { status: "active" },
              include: [
                {
                  model: Permission,
                  where: { status: "active" },
                },
              ],
            },
          ],
        },
      ],
    });

    return {
      stores: __STORES.map((store) => {
        store = store.toJSON();
        const storeUser = store.store_users[0];
        if (storeUser.is_store_owner) {
          store.is_store_owner = true;
          store.controllers = __CONTROLLERS.map((c) => {
            return c.toJSON();
          });
        } else {
          store.is_store_owner = false;
          if (storeUser.role) {
            store.controllers = storeUser.role.permissions.map((permission) => {
              let controller = null;

              __CONTROLLERS.forEach((c) => {
                c = c.toJSON();
                if (c.controller_id == permission.controller_id) {
                  controller = c;
                }
              });

              return controller;
            });
          } else {
            store.controllers = [];
          }
        }

        delete store.store_users;
        return store;
      }),
    };
  } catch (err) {
    throw err;
  }
};

const createClaimStoreRequest = async function (data, user_id) {
  // data = {store_id, store_ein}
  try {
    const { store_id, store_ein } = data;

    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });

    if (!__STORE) {
      throw "Store not found";
    }

    const __IS_STORE_EMPLOYEE_EXISTS = await StoreUser.findOne({
      where: { store_id, status: "active" },
    });

    if (__IS_STORE_EMPLOYEE_EXISTS) {
      throw "Can not create claim request as it is already claimed";
    }

    const __IS_CLAIM_REQUEST_EXISTS = await ClaimStore.findOne({
      where: { store_id, user_id, status: "active" },
    });

    if (__IS_CLAIM_REQUEST_EXISTS) {
      throw "Claim request is already sent";
    }

    const __CLAIM_STORE = await ClaimStore.create({
      store_id,
      user_id,
      store_ein,
      claim_status: "new",
      status: "active",
    });

    const __ADMIN_NOTIFICATION = await AdminNotification.create({
      claim_store_id: __CLAIM_STORE.id,
      is_read: false,
      title: `Claim request for store '${__STORE.store_name}'`,
      message: `New claim request for store '${__STORE.store_name}'`,
      status: "active",
    });

    return { claim_store_id: __CLAIM_STORE.id };
  } catch (err) {
    throw err;
  }
};

const showUnClaimStores = async function (data) {
  try {
    const { q, page, page_size, longitude, latitude, mileage } = data;

    const __CLAIMED_STORES = await Store.findAll({
      where: { status: "active" },
      include: [
        { model: StoreUser, where: { status: "active", is_store_owner: true } },
      ],
    });

    const distanceAttribute =
      latitude && longitude
        ? [
            [
              sequelize.literal(`
            3959 * acos(
                cos(radians(${latitude})) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(${longitude})) +
                sin(radians(${latitude})) *
                sin(radians(latitude))
            )
            `),
              "distance",
            ],
          ]
        : [];

    const distanceWhere =
      latitude && longitude && mileage
        ? [
            sequelize.literal(`
                    3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                    ) <= ${mileage}
                `),
          ]
        : [];

    const query = {
      attributes: [
        ["id", "store_address_id"],
        "address_name",
        "longitude",
        "latitude",
        "address_line_1",
        "address_line_2",
        "landmark",
        "city",
        "postal_code",
        ...distanceAttribute,
      ],
      where: [
        {
          [Op.and]: [
            {
              status: "active",
            },
            ...distanceWhere,
          ],
        },
      ],
      include: [
        {
          model: State,
          where: { status: "active" },
          include: [
            {
              model: Country,
              where: { status: "active" },
            },
          ],
        },
        {
          model: Store,
          required: true,
          where: {
            id: { [Op.notIn]: __CLAIMED_STORES.map((cs) => cs.id) },
            store_name: { [Op.iLike]: q + "%" },
            status: "active",
            is_verified: false,
          },
          attributes: [
            ["id", "store_id"],
            "logo_url",
            "store_name",
            "is_verified",
            "is_enabled",
            "image_url",
            "store_phone",
            "store_phone_code",
          ],
          include: [
            {
              model: StoreUser,
              required: false,
            },
          ],
        },
      ],
    };

    const __STORE__ADDRESSES = await CommonController.getPaginationResult({
      Model: StoreAddress,
      query,
      page,
      page_size,
      order: [
        [
          sequelize.col(
            distanceWhere.length == 0 ? "address_name" : "distance"
          ),
          "ASC",
        ],
        [sequelize.col("store_address_id"), "ASC"],
      ],
      as: "data",
    });

    const store_addresses = __STORE__ADDRESSES.data.map((store_address) => {
      store_address = store_address.toJSON();
      const store = store_address.store;
      const logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
      const image = S3Controller.getAwsS3SignedFileUrl(store.image_url);

      delete store.logo_url;
      delete store.image_url;
      delete store_address.store;

      let has_store_owner = store.store_users.length ? true : false;
      delete store.store_users;

      store_address.store = Object.assign(
        { logo, image, has_store_owner },
        store
      );
      return store_address;
    });

    return { total_count: __STORE__ADDRESSES.total_count, store_addresses };
  } catch (err) {
    throw err;
  }
};

/**
 * ////////////////////////////
 * /////////--SHOP--///////////
 * ////////////////////////////
 */

// By Saurav Pandey
const shop_getNearbyStores = async function (data, user_id) {
  try {
    let {
      q,
      page,
      page_size,
      longitude,
      latitude,
      postal_code,
      mileage,
      is_open_now,
      opening_time,
      closing_time,
      delivery_services,
      city,
      state,
      country,
      place_id,
    } = data;

    // console.log(data);

    const postelCodeFromFrontend = postal_code;

    if (place_id) {
      const geoParameters = await USPSController.getGeoParametersByPlaceId(
        place_id
      );
      if (geoParameters.result) {
        city = null;
        state = null;
        // country = geoParameters.country;
        country = null;
        postal_code = geoParameters.postal_code;
        longitude = geoParameters.longitude;
        latitude = geoParameters.latitude;
      }
    }

    // if (postal_code ) {
    //   const geoParameters = await USPSController.getGeoParametersByPostalCode(
    //     postal_code
    //   );
    //   if (geoParameters.result) {
    //     latitude = geoParameters.latitude;
    //     longitude = geoParameters.longitude;
    //   }
    // }
    if (postelCodeFromFrontend) {
      postal_code = postelCodeFromFrontend;
      const geoParameters = await USPSController.getGeoParametersByPostalCode(
        postal_code
      );
      if (geoParameters.result) {
        latitude = geoParameters.latitude;
        longitude = geoParameters.longitude;
      }
    }

    const cityWhere =
      city && !postal_code ? { city: { [Op.iLike]: `%${city}%` } } : {};
    const stateWhere =
      state && !postal_code ? { state_name: { [Op.iLike]: `%${state}%` } } : {};
    const countryWhere =
      country && !postal_code
        ? { country_name: { [Op.iLike]: `%${country}%` } }
        : {};

    const whereDeliveryServices = delivery_services?.length
      ? { delivery_service_name: { [Op.in]: delivery_services } }
      : {};

    latitude = Number(latitude);
    longitude = Number(longitude);

    const currentTimeFromCoordinates = HELPERS.getLocalTimeFromCoordinates(
      latitude,
      longitude
    );

    const dayOfWeek = HELPERS.getLocalDayFromCoordinates(latitude, longitude);

    let isOpen = {};

    if (is_open_now === true) {
      isOpen = {
        [Op.or]: [
          { is_24_hours_active: true },
          {
            [Op.and]: [
              { day_of_week: dayOfWeek },
              {
                opening_time: {
                  [Op.lte]: currentTimeFromCoordinates,
                },
              },
              {
                closing_time: {
                  [Op.gte]: currentTimeFromCoordinates,
                },
              },
            ],
          },
        ],
      };
    } else if (is_open_now === false) {
      isOpen = {
        [Op.or]: [
          // Stores explicitly closed based on opening/closing time
          {
            is_24_hours_active: false,
            day_of_week: dayOfWeek,
            [Op.or]: [
              {
                opening_time: {
                  [Op.gt]: currentTimeFromCoordinates,
                },
              },
              {
                closing_time: {
                  [Op.lt]: currentTimeFromCoordinates,
                },
              },
            ],
          },
          // Stores with no entry for the current day (completely closed)
          {
            store_id: {
              [Op.notIn]: sequelize.literal(
                `(SELECT DISTINCT store_id FROM store_timings WHERE day_of_week = ${dayOfWeek} AND status = 'active')`
              ),
            },
          },
        ],
      };
    }

    const openTime = opening_time
      ? { opening_time: { [Op.lte]: opening_time } }
      : {};

    const closeTime = closing_time
      ? { closing_time: { [Op.gte]: closing_time } }
      : {};

    const user = user_id ? { user_id } : {};

    const haversineFormula = (lat, long) => `
  3959 * acos(
    cos(radians(${lat})) *
    cos(radians(latitude)) *
    cos(radians(longitude) - radians(${long})) +
    sin(radians(${lat})) *
    sin(radians(latitude))
  )
`;

    const distanceAttribute =
      latitude && longitude
        ? [
            [
              sequelize.literal(haversineFormula(latitude, longitude)),
              "distance",
            ],
          ]
        : [];

    const distanceWhere =
      latitude && longitude && mileage
        ? [
            sequelize.literal(
              `${haversineFormula(latitude, longitude)} <= ${mileage}`
            ),
          ]
        : [];

    const storeNameFilter =
      q && q?.trim?.length
        ? {
            store_name: { [Op.iLike]: `%${q}%` },
          }
        : {};

    const query = {
      attributes: [
        ["id", "store_address_id"],
        "address_name",
        "longitude",
        "latitude",
        "address_line_1",
        "address_line_2",
        "landmark",
        "city",
        "postal_code",
        ...distanceAttribute,
      ],
      where: {
        [Op.and]: [
          {
            status: "active",
            ...cityWhere,
          },
          ...distanceWhere,
        ],
      },
      include: [
        {
          model: State,
          where: { ...stateWhere, status: "active" },
          include: [
            {
              model: Country,
              where: { ...countryWhere, status: "active" },
            },
          ],
        },
        {
          model: Store,
          required: true,
          where: {
            ...storeNameFilter,
            status: "active",
            is_enabled: true,
          },
          attributes: [
            ["id", "store_id"],
            "logo_url",
            "store_name",
            "is_verified",
            "is_enabled",
            "image_url",
          ],
          include: [
            {
              model: StoreTiming,
              required: true,
              attributes: [
                ["id", "store_timing_id"],
                "is_24_hours_active",
                "day_of_week",
                "opening_time",
                "closing_time",
                "status",
              ],
              where: {
                ...isOpen,
                ...openTime,
                ...closeTime,
                status: "active",
              },
            },
            {
              // get all the store's timmings
              model: StoreTiming,
              // required: false, // Include all store timings
              required: true,
              attributes: [
                ["id", "store_timing_id"],
                "is_24_hours_active",
                "day_of_week",
                "opening_time",
                "closing_time",
                "status",
              ],
              where: {
                status: "active",
              },
              as: "all_store_timings", // Use an alias to avoid conflicts
            },
            {
              model: StoreUser,
              required: false,
              where: { is_store_owner: true, status: "active" },
              attributes: [["is_store_owner", "has_store_owner"]],
            },
            {
              model: FavouriteStore,
              required: false,
              where: { ...user, status: "active" },
              attributes: [["id", "favourite_store_id"], "status"],
            },
            {
              model: StoreDeliveryService,
              required: delivery_services?.length ? true : false,
              where: { status: "active" },
              attributes: [
                ["id", "store_delivery_service_id"],
                "delivery_service_id",
                "is_enabled",
                "status",
              ],
              include: [
                {
                  model: DeliveryService,
                  required: true,
                  where: {
                    ...whereDeliveryServices,
                    is_enabled: true,
                    status: "active",
                  },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const __STORE__ADDRESSES = await CommonController.getPaginationResult({
      Model: StoreAddress,
      query,
      page,
      page_size,
      order: [
        // [sequelize.col(latitude == 0 ? "address_name" : "distance"), "ASC"],
        // [
        //   sequelize.col(
        //     distanceWhere.length == 0 ? "address_name" : "distance"
        //   ),
        //   "ASC",
        // ],
        [sequelize.col("distance"), "ASC"],
        // [sequelize.col("distance"), "DESC"],
      ],
      as: "data",
    });

    const __DELIVERY_SERVICES = await listDeliveryServices();
    const deliveryServices = __DELIVERY_SERVICES.delivery_services;

    const store_addresses = __STORE__ADDRESSES?.data?.map((store_address) => {
      store_address = store_address.toJSON();
      const store = store_address.store;
      const logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
      const image = S3Controller.getAwsS3SignedFileUrl(store.image_url);

      delete store.logo_url;
      delete store.image_url;
      delete store_address.store;

      let has_store_owner = store?.store_users?.length ? true : false;
      delete store.store_users;

      let is_favourite_store = store?.favourite_stores?.length ? true : false;
      delete store.favourite_stores;

      store.store_timings = store?.all_store_timings;
      delete store.all_store_timings;

      store?.store_delivery_services?.forEach((ds) => {
        let deliveryService = null;

        deliveryServices.map((__DS) => {
          __DS = __DS.toJSON();
          if (__DS.delivery_service_id == ds.delivery_service_id) {
            deliveryService = __DS;
          }
        });

        if (deliveryService) {
          ds.delivery_service_name = deliveryService.delivery_service_name;
        }
      });

      store_address.store = Object.assign(
        { logo, image, has_store_owner, is_favourite_store },
        store
      );
      return store_address;
    });

    // console.log(store_addresses?.map((data) => data?.distance));

    return { total_count: __STORE__ADDRESSES?.total_count, store_addresses };
  } catch (err) {
    throw err;
  }
};

const shop_StoreDetails = async function (data, user_id = null) {
  // data = {store_id, longitude, latitude}
  try {
    const { store_id, longitude, latitude } = data;
    const __STORE = await getStoreDetails(store_id, user_id);
    if (user_id && longitude && latitude) {
      const address = await USPSController.getAddressUsingLatLong(
        latitude,
        longitude
      );
      if (address.result && address.address) {
        await StoreVisitor.create({
          user_id,
          store_id,
          longitude,
          latitude,
          status: "active",
          address: address.full_address,
          city: address.address.city || address.address.town,
          state: address.address.state,
          country: address.address.country,
        });
      }

      const __PREVIOUS_STORE = await PreviousStore.findOne({
        where: { store_id, user_id, status: "active" },
      });

      if (__PREVIOUS_STORE) {
        await PreviousStore.update(
          { count: __PREVIOUS_STORE.count + 1 },
          { where: { id: __PREVIOUS_STORE.id } }
        );
      } else {
        await PreviousStore.create({
          count: 1,
          user_id,
          store_id,
          status: "active",
        });
      }
    }
    return __STORE;
  } catch (err) {
    console.log("Catched Error: ", err);
    throw err;
  }
};

const shop_PreviousStores = async function (data, user_id) {
  // data = {page, page_size}
  try {
    const { page, page_size } = data;

    const query = {
      where: { user_id, status: "active" },
      attributes: { exclude: ["id"] },
      include: [
        {
          model: Store,
          attributes: { include: [["id", "store_id"]], exclude: ["id"] },
          where: { status: "active" },
          include: [
            {
              model: FavouriteStore,
              required: false,
              where: { user_id, status: "active" },
            },
            {
              model: StoreTiming,
              required: false,
              attributes: [
                ["id", "store_timing_id"],
                "is_24_hours_active",
                "day_of_week",
                "opening_time",
                "closing_time",
                "status",
              ],
              where: { status: "active" },
            },
            {
              model: StoreUser,
              required: false,
              where: { is_store_owner: true, status: "active" },
              attributes: [["is_store_owner", "has_store_owner"]],
            },
            {
              model: StoreAddress,
              required: false,
              where: { status: "active" },
            },
            {
              model: StoreDeliveryService,
              required: false,
              where: { status: "active" },
              attributes: [
                ["id", "store_delivery_service_id"],
                "delivery_service_id",
                "is_enabled",
                "status",
              ],
              include: [
                {
                  model: DeliveryService,
                  required: true,
                  where: { is_enabled: true, status: "active" },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const order = [["updatedAt", "DESC"]];

    const __PREVIOUS_STORES = await CommonController.getPaginationResult({
      Model: PreviousStore,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const __DELIVERY_SERVICES = await listDeliveryServices();
    const delivery_services = __DELIVERY_SERVICES.delivery_services;

    const previousStores = __PREVIOUS_STORES.data.map((ps) => {
      ps = ps.toJSON();
      const store = ps.store;
      store.logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
      store.image = S3Controller.getAwsS3SignedFileUrl(store.image_url);

      store.is_favourite_store = store?.favourite_stores?.length ? true : false;
      store.has_store_owner = store.store_users.length ? true : false;

      store?.store_delivery_services.forEach((ds) => {
        let deliveryService = null;

        delivery_services.map((__DS) => {
          __DS = __DS.toJSON();
          if (__DS.delivery_service_id == ds.delivery_service_id) {
            deliveryService = __DS;
          }
        });

        if (deliveryService) {
          ds.delivery_service_name = deliveryService.delivery_service_name;
        }
      });

      delete store.logo_url;
      delete store.image_url;
      delete store.favourite_stores;
      delete store.store_users;

      return store;
    });

    return {
      total_count: __PREVIOUS_STORES.total_count,
      previous_stores: previousStores,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const shop_FavouriteStores = async function (data, user_id) {
  // data = {page, page_size}
  try {
    const { page, page_size } = data;
    const query = {
      where: { user_id, status: "active" },
      attributes: { exclude: ["id"] },
      include: [
        {
          model: Store,
          attributes: { include: [["id", "store_id"]], exclude: ["id"] },
          where: { status: "active" },
          include: [
            {
              model: StoreTiming,
              required: false,
              attributes: [
                ["id", "store_timing_id"],
                "is_24_hours_active",
                "day_of_week",
                "opening_time",
                "closing_time",
                "status",
              ],
              where: { status: "active" },
            },
            {
              model: StoreUser,
              required: false,
              where: { is_store_owner: true, status: "active" },
              attributes: [["is_store_owner", "has_store_owner"]],
            },
            {
              model: StoreAddress,
              required: false,
              where: { status: "active" },
            },
            {
              model: StoreDeliveryService,
              required: false,
              where: { status: "active" },
              attributes: [
                ["id", "store_delivery_service_id"],
                "delivery_service_id",
                "is_enabled",
                "status",
              ],
              include: [
                {
                  model: DeliveryService,
                  required: true,
                  where: { is_enabled: true, status: "active" },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const order = [["updatedAt", "DESC"]];

    const __FAVOURITE_STORE = await CommonController.getPaginationResult({
      Model: FavouriteStore,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const __DELIVERY_SERVICES = await listDeliveryServices();
    const delivery_services = __DELIVERY_SERVICES.delivery_services;

    const favouriteStores = __FAVOURITE_STORE.data.map((fs) => {
      fs = fs.toJSON();
      const store = fs.store;
      store.logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
      store.image = S3Controller.getAwsS3SignedFileUrl(store.image_url);

      store.is_favourite_store = true;
      store.has_store_owner = store.store_users.length ? true : false;

      store?.store_delivery_services.forEach((ds) => {
        let deliveryService = null;

        delivery_services.map((__DS) => {
          __DS = __DS.toJSON();
          if (__DS.delivery_service_id == ds.delivery_service_id) {
            deliveryService = __DS;
          }
        });

        if (deliveryService) {
          ds.delivery_service_name = deliveryService.delivery_service_name;
        }
      });

      delete store.logo_url;
      delete store.image_url;
      delete store.store_users;
      return store;
    });

    return {
      total_count: __FAVOURITE_STORE.total_count,
      favourite_stores: favouriteStores,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * ////////////////////////////
 * /////////--ADMIN--///////////
 * ////////////////////////////
 */

const admin_listStores = async function (data) {
  // data = {q, page, page_size, order_by, order_type}
  try {
    const { q, page, page_size, order_by, order_type } = data;

    const order =
      order_by && order_type
        ? [[order_by == "store_id" ? "id" : order_by, order_type]]
        : ["id", "DESC"];

    const query = {
      where: {
        store_name: { [Op.iLike]: `%${q}%` },
        status: "active",
      },
      attributes: {
        include: [["id", "store_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: StoreUser,
          required: false,
          where: { is_store_owner: true },
          include: [
            {
              model: User,
            },
          ],
        },
      ],
    };

    const __STORES = await CommonController.getPaginationResult({
      Model: Store,
      query,
      order,
      page,
      page_size,
      as: "stores",
    });

    return __STORES;
  } catch (err) {
    throw err;
  }
};

const admin_listClaimStoreRequests = async function (data) {
  // data = {q, page, page_size, order_by, order_type, claim_status}
  try {
    const { q, page, page_size, order_by, order_type, claim_status } = data;

    const order =
      order_by && order_type
        ? [[order_by == "claim_store_id" ? "id" : order_by, order_type]]
        : [["id", "DESC"]];
    const whereClaimRequest = claim_status ? { claim_status } : {};

    const query = {
      where: {
        ...whereClaimRequest,
        status: "active",
      },
      attributes: {
        include: [["id", "claim_store_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          where: { store_name: { [Op.iLike]: `%${q}%` }, status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
        {
          model: User,
          where: { status: "active" },
          attributes: {
            include: [["id", "user_id"]],
            exclude: ["id"],
          },
        },
      ],
    };

    const __CLAIM_STORES = await CommonController.getPaginationResult({
      Model: ClaimStore,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const claim_stores = __CLAIM_STORES.data.map((cs) => {
      const claimStore = cs.toJSON();
      claimStore.store.image = S3Controller.getAwsS3SignedFileUrl(
        claimStore.store.image_url
      );
      claimStore.store.logo = S3Controller.getAwsS3SignedFileUrl(
        claimStore.store.logo_url
      );
      claimStore.user.image = S3Controller.getAwsS3SignedFileUrl(
        claimStore.user.image_url
      );
      delete claimStore.store.image_url;
      delete claimStore.store.logo_url;
      delete claimStore.user.image_url;

      return claimStore;
    });

    return { total_count: __CLAIM_STORES.total_count, claim_stores };
  } catch (err) {
    throw err;
  }
};

const admin_claimStoreDetails = async function (data) {
  // data = {claim_store_id}
  try {
    const { claim_store_id } = data;

    const __CLAIM_STORE = await ClaimStore.findOne({
      where: {
        id: claim_store_id,
        status: "active",
      },
      attributes: {
        include: [["id", "claim_store_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
        {
          model: User,
          where: { status: "active" },
          attributes: {
            include: [["id", "user_id"]],
            exclude: ["id"],
          },
        },
      ],
    });

    if (!__CLAIM_STORE) {
      throw "Claim request not found";
    }

    await ClaimStore.update(
      {
        claim_status:
          __CLAIM_STORE.claim_status == "new"
            ? "pending"
            : __CLAIM_STORE.claim_status,
      },
      { where: { id: claim_store_id } }
    );

    const claimStore = __CLAIM_STORE.toJSON();
    claimStore.store.image = S3Controller.getAwsS3SignedFileUrl(
      claimStore.store.image_url
    );
    claimStore.store.logo = S3Controller.getAwsS3SignedFileUrl(
      claimStore.store.logo_url
    );
    claimStore.user.image = S3Controller.getAwsS3SignedFileUrl(
      claimStore.user.image_url
    );

    delete claimStore.store.image_url;
    delete claimStore.store.logo_url;
    delete claimStore.user.image_url;

    return { claim_store: claimStore };
  } catch (err) {
    throw err;
  }
};

const admin_acceptClaimRequest = async function (data) {
  // data = {claim_store_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { claim_store_id } = data;

    const __CLAIM_STORE = await ClaimStore.findOne({
      where: { id: claim_store_id, claim_status: "pending", status: "active" },
    });

    if (!__CLAIM_STORE) {
      throw "Claim store request not found";
    }

    const STORE_VERIFIED = await Store.update(
      {
        is_verified: true,
        verified_by: "admin",
        store_ein: __CLAIM_STORE.store_ein,
      },
      {
        where: { id: __CLAIM_STORE.store_id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const CLAIM_ACCEPTED = await ClaimStore.update(
      {
        claim_status: "accepted",
      },
      {
        where: { id: claim_store_id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const storeOwner = await StoreUser.create(
      {
        store_id: __CLAIM_STORE.store_id,
        user_id: __CLAIM_STORE.user_id,
        is_store_owner: true,
        is_verified: true,
        verifiedAt: moment().utc().toDate(),
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __USER = await User.findOne({ where: { id: __CLAIM_STORE.user_id } });
    const __STORE = await Store.findOne({
      where: { id: __CLAIM_STORE.store_id },
    });

    await SnsController.sendEmail(
      __USER.email,
      "Claim request has been accepted for the store '" +
        __STORE.store_name +
        "'",
      cliamStore_Template(__STORE.store_name, "Accepted"),
      process.env.DATA_EMAIL //In From data@thegreenmall.net
    );

    await __SQL_TRANSACTION.commit();
    return { is_accepted: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const admin_rejectClaimRequest = async function (data) {
  // data = {claim_store_id}
  try {
    const { claim_store_id } = data;
    const __CLAIM_STORE = await ClaimStore.findOne({
      where: { id: claim_store_id, claim_status: "pending", status: "active" },
    });

    if (!__CLAIM_STORE) {
      throw "Claim request not found";
    }

    await ClaimStore.update(
      {
        claim_status: "rejected",
      },
      {
        where: { id: claim_store_id },
      }
    );

    const __USER = await User.findOne({ where: { id: __CLAIM_STORE.user_id } });
    const __STORE = await Store.findOne({
      where: { id: __CLAIM_STORE.store_id },
    });

    await SnsController.sendEmail(
      __USER.email,
      "Claim request has been rejected for the store '" +
        __STORE.store_name +
        "'",
      cliamStore_Template(__STORE.store_name, "Rejected"),
      process.env.DATA_EMAIL //In From data@thegreenmall.net
    );

    return { is_rejetcted: true };
  } catch (err) {
    throw err;
  }
};

const admin_deleteClaimRequest = async function (data) {
  // data = {claim_store_id}
  try {
    const { claim_store_id } = data;
    await ClaimStore.update(
      {
        status: "deleted",
      },
      {
        where: { id: claim_store_id },
      }
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const admin_listStoreServiceCharges = async function (data) {
  // data = {q, page, page_size, order_by, order_type}
  try {
    const { q, page, page_size, order_by, order_type } = data;

    const order =
      order_by && order_type
        ? [
            [
              order_by == "store_service_charge_id" ? "id" : order_by,
              order_type,
            ],
          ]
        : [["id", "DESC"]];

    const query = {
      where: { store_id: { [Op.ne]: null }, status: "active" },
      attributes: {
        include: [["id", "store_service_charge_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          where: { is_verified: true, status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
      ],
    };

    const __STORE_SERVICE_CHARGES = await CommonController.getPaginationResult({
      Model: StoreServiceCharge,
      query,
      page,
      page_size,
      order,
      as: "store_service_charges",
    });
    return __STORE_SERVICE_CHARGES;
  } catch (err) {
    throw err;
  }
};

const admin_getServiceCharges = async function (data) {
  // data = {store_service_charge_id}
  try {
    const { store_service_charge_id } = data;
    const __STORE_SERVICE_CHARGE = await StoreServiceCharge.findOne({
      where: { id: store_service_charge_id, status: "active" },
      attributes: {
        include: [["id", "store_service_charge_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
      ],
    });

    if (!__STORE_SERVICE_CHARGE) {
      throw "Store service charge not found";
    }

    return { store_service_charge: __STORE_SERVICE_CHARGE };
  } catch (err) {
    throw err;
  }
};

const admin_getDefaultStoreServiceCharge = async function () {
  try {
    const __STORE_SERVICE_CHARGE = await StoreServiceCharge.findOne({
      where: { store_id: null, status: "active" },
      attributes: {
        include: [["id", "store_service_charge_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
      ],
    });

    if (!__STORE_SERVICE_CHARGE) {
      throw "Store service charge not found";
    }

    return { store_service_charge: __STORE_SERVICE_CHARGE };
  } catch (err) {
    throw err;
  }
};

const admin_createServiceCharge = async function (data) {
  // data = {store_id, service_charge_type, service_charge_value}
  try {
    const { store_id, service_charge_type, service_charge_value } = data;
    const __SERVICE_CHARGE_EXISTS = await StoreServiceCharge.findOne({
      where: { store_id, status: "active" },
    });

    if (__SERVICE_CHARGE_EXISTS) {
      throw "Store service charge already exists";
    }

    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });
    if (!__STORE) {
      throw "Store unavailable";
    }

    const __STORE_SERVICE_CHARGE = await StoreServiceCharge.create({
      store_id,
      service_charge_type,
      service_charge_value,
      status: "active",
    });

    return { store_service_charge_id: __STORE_SERVICE_CHARGE.id };
  } catch (err) {
    throw err;
  }
};

const admin_updateServiceCharge = async function (data) {
  // data = {store_service_charge_id, service_charge_type, service_charge_value}
  try {
    const {
      store_service_charge_id,
      service_charge_type,
      service_charge_value,
    } = data;
    await StoreServiceCharge.update(
      { service_charge_type, service_charge_value },
      { where: { id: store_service_charge_id } }
    );
    return { is_updated: true };
  } catch (err) {
    throw err;
  }
};

const admin_deleteServiceCharge = async function (data) {
  // data = {store_service_charge_id}
  try {
    const { store_service_charge_id } = data;
    const __STORE_SERVICE_CHARGE = await StoreServiceCharge.findOne({
      where: { id: store_service_charge_id },
    });

    if (__STORE_SERVICE_CHARGE && __STORE_SERVICE_CHARGE.store_id == null) {
      throw "Can not delete the default service charge";
    }

    await StoreServiceCharge.update(
      { status: "deleted" },
      { where: { id: store_service_charge_id } }
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const admin_bulkCreateStore = async function (file) {
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const workbook = new ExcelJS.Workbook();
    const xl = await workbook.xlsx.load(file.buffer);

    const __TAX = await Tax.findOne({ where: { status: "active" } });

    const datas = [];
    const columns = [];

    const worksheet = workbook.getWorksheet(1);
    worksheet.eachRow((row) => {
      const data = {
        store: {
          store_name: "",
          store_ein: "",
          image_url: null,
          logo_url: null,
          store_nick_name: "",
          store_email: "",
          store_phone: "",
          store_phone_code: "",
          is_verified: false,
          is_enabled: true,
          status: "active",
          store_balance: 0,
          tax_value: __TAX.tax_value,
        },
        store_address: {
          address_name: "home",
          longitude: 0,
          latitude: 0,
          address_line_1: "",
          address_line_2: "",
          landmark: "",
          city: "",
          postal_code: 0,
          state_id: null,
          store_id: null,
          status: "active",
        },
        store_timing: {
          store_id: null,
          is_24_hours_active: true,
          day_of_week: 7,
          opening_time: "00:00:00",
          closing_time: "23:59:59",
          status: "active",
        },
      };

      row.eachCell((cell) => {
        if (cell.row == "1") {
          return columns.push(cell.value);
        }
        const colName = columns[cell.col - 1];
        const currentRow = cell.row;

        if (colName == "Name")
          data.store.store_name = cell.value.trim() == "" ? null : cell.value;
        if (colName == "Email") {
          const user_email = cell.value?.text || cell.value;
          data.store.store_email = user_email.trim() == "" ? null : user_email;
        }
        if (colName == "Country Code")
          data.store.store_phone_code =
            cell.value == "" ? null : "+" + cell.value;
        if (colName == "Phone")
          data.store.store_phone = cell.value == "" ? null : cell.value;
        if (colName == "Address Line 1")
          data.store_address.address_line_1 =
            cell.value.trim() == "" ? null : cell.value;
        if (colName == "Address Line 2")
          data.store_address.address_line_2 = cell.value;
        if (colName == "City") data.store_address.city = cell.value;
        if (colName == "State")
          data.store_address.state =
            cell.value.trim() == "" ? null : cell.value;
        if (colName == "Country")
          data.store_address.country =
            cell.value.trim() == "" ? null : cell.value;
        if (colName == "Zip Code") data.store_address.postal_code = cell.value;
        if (colName == "Tax") {
          data.store.tax_value = parseFloat(cell.value);
        }
      });
      if (row.number != 1) {
        if (data.store.store_name == "")
          throw "Store name can not be empty at row : " + row.number;
        if (data.store.tax_value <= 0)
          throw "Tax can not be less than or equals '0' at row : " + row.number;
        if (data.store.store_email == "")
          throw "Email can not be empty at row : " + row.number;
        if (data.store.store_phone_code == "")
          throw "Country code can not be empty at row : " + row.number;
        if (data.store.store_phone == "")
          throw "Phone can not be empty at row : " + row.number;
        if (data.store_address.address_line_1 == "")
          throw "Address line 1 can not be empty at row : " + row.number;
        if (data.store_address.country == "")
          throw "Country can not be empty at row : " + row.number;
        if (data.store_address.state == "")
          throw "State can not be empty at row : " + row.number;
        if (data.store_address.postal_code == "")
          throw "Postal code can not be empty at row : " + row.number;
        if (data.store_address.city == "")
          throw "City can not be empty at row : " + row.number;

        datas.push(data);
      }
    });

    const workSheetImages = worksheet.getImages();
    for (let i = 0; i < workSheetImages.length; i++) {
      const image = workSheetImages[i];
      const img = workbook.model.media.find((m) => m.index === image.imageId);
      if (!img) continue;

      img.mimetype = img.type + "/" + img.extension;
      img.originalname = img.name + "." + img.extension;
      const s3Image = await S3Controller.uploadFile(img);

      const row = image.range.tl.nativeRow - 1;
      const col = image.range.tl.nativeCol;

      let colName = "";

      if (col == 1) {
        colName = "image_url";
      }
      if (col == 2) {
        colName = "logo_url";
      }

      datas[row].store[colName] = s3Image.orignal_url;
    }
    const __STORES = await Store.bulkCreate(
      datas.map((d) => d.store),
      { transaction: __SQL_TRANSACTION }
    );

    const __DEFAULT_ROLES_PERMISSIONS = await DefaultRole.findAll({
      where: { status: "active" },
      include: [
        {
          model: DefaultPermission,
          required: false,
          where: { status: "active" },
        },
      ],
    });

    for (let i = 0; i < __STORES.length; i++) {
      const store = __STORES[i];
      datas[i].store_timing.store_id = store.id;
      datas[i].store.store_id = store.id;
      datas[i].store_address.store_id = store.id;
      const state_id = await CommonController.getStateId(
        datas[i].store_address.country,
        datas[i].store_address.state
      );
      datas[i].store_address.state_id = state_id;

      const { result, longitude, latitude, error } =
        await USPSController.getLatLongUsingZip(
          datas[i].postal_code,
          `${datas[i].store_address.address_line_1}, ${datas[i].store_address.city}, ${datas[i].store_address.state}, ${datas[i].store_address.country}`
        );

      if (longitude && latitude) {
        datas[i].store_address.longitude = longitude;
        datas[i].store_address.latitude = latitude;
      }

      for (let i = 0; i < __DEFAULT_ROLES_PERMISSIONS.length; i++) {
        const defaultRole = __DEFAULT_ROLES_PERMISSIONS[i];
        const __ROLE = await Role.create(
          {
            role_name: defaultRole.role_name,
            store_id: store.id,
            status: "active",
          },
          {
            transaction: __SQL_TRANSACTION,
          }
        );

        await Permission.bulkCreate(
          defaultRole.default_permissions.map((defaultPermission) => {
            return {
              controller_id: defaultPermission.controller_id,
              role_id: __ROLE.id,
              status: "active",
            };
          }),
          {
            transaction: __SQL_TRANSACTION,
          }
        );
      }
    }

    const __STORE__ADDRESSES = await StoreAddress.bulkCreate(
      datas.map((d) => d.store_address),
      { transaction: __SQL_TRANSACTION }
    );

    const __STORE__TIMINGS = await StoreTiming.bulkCreate(
      datas.map((d) => d.store_timing),
      { transaction: __SQL_TRANSACTION }
    );

    await __SQL_TRANSACTION.commit();
    return { stores: datas };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const admin_verifyStore = async function (data) {
  // data = {store_id}
  try {
    const { store_id } = data;

    const __STORE_USER = await StoreUser.findOne({
      where: { store_id, is_verified: true, is_store_owner: true },
    });

    if (!__STORE_USER) {
      throw "Can not verify as there is no store owner for this store.";
    }

    const __STORE = await Store.findOne({ where: { id: store_id } });

    if (__STORE.is_verified) {
      throw "Store is already verified.";
    }

    await Store.update(
      {
        is_verified: true,
        verified_by: "admin",
      },
      {
        where: { id: store_id },
      }
    );

    return {
      is_verified: true,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createStore,
  createStoreUser,
  verifyStoreUser,
  getStoreUserList,
  getAllControllers,
  deleteStore,
  createStoreRole,
  listStoreRoles,
  getStoreUser,
  deleteStoreUser,
  deleteStoreRole,
  getUserStores,
  getStoreDetails,
  editStoreDetails,
  editStoreUserDetails,
  getStoreUserDetailsByStoreUser,
  getStoreRole,
  editStoreRole,
  listDeliveryServices,
  createClaimStoreRequest,
  listStorePages,
  updateStoreDynamicLink,
  saveStorePage,
  getStorePageDetails,
  getStoreOwnerStores,
  getStorePermissions,
  getStoresWithManageOrderPermissions,
  showUnClaimStores,

  shop_getNearbyStores,
  shop_StoreDetails,
  shop_PreviousStores,
  shop_FavouriteStores,

  admin_listStores,
  admin_listClaimStoreRequests,
  admin_claimStoreDetails,
  admin_acceptClaimRequest,
  admin_rejectClaimRequest,
  admin_deleteClaimRequest,
  admin_listStoreServiceCharges,
  admin_getServiceCharges,
  admin_createServiceCharge,
  admin_updateServiceCharge,
  admin_deleteServiceCharge,
  admin_bulkCreateStore,
  admin_getDefaultStoreServiceCharge,
  admin_verifyStore,
};
