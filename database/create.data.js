require("custom-env").env(true);

const countryState = require("countrycitystatejson");
const csc = require("country-state-city");
const Admin = require("./../models/admin/admin.model");

const config = require("./../config/config.json");
const Module = require("../models/module/module.model");
const Controller = require("../models/module/controller.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const ProofType = require("../models/proof/proof_type.model");
const QuantityType = require("../models/catalogue/quantity_type.model");
const DeliveryService = require("../models/delivery/delivery_service.model");
const OrderServiceCharge = require("../models/order/order_service_charge.model");
const OrderStatus = require("../models/order/order_status.model");
const PaymentService = require("../models/transaction/payment_service.model");
const CommonController = require("../controllers/common.controller");
const ReturnOrderItemStatus = require("../models/order/return_order_item_status.model");
const StoreServiceCharge = require("../models/store/store_service_charge.model");
const PageType = require("../models/page/page_type.model");
const MembershipPlan = require("../models/transaction/membership_plan.model");
const logger = require("../logger/logger");
const Tax = require("../models/tax/tax.model");
const DefaultRole = require("../models/module/default_role.model");

// this is the process runs while starting the application
async function createModuleAndControllers() {
  try {
    const modules = config.modules;
    for (const mod of modules) {
      const __MODULE = await CommonController.upsert(Module, mod, {
        module_key: mod.module_key,
      });
    }

    for (const con of config.controllers) {
      const mod = await Module.findOne({
        where: { module_key: con.module_key, status: "active" },
      });
      if (!mod) {
        continue;
      }
      con.module_id = mod.id;
      const __CONTROLLER = await CommonController.upsert(Controller, con, {
        controller_key: con.controller_key,
      });
    }
  } catch (err) {
    throw err;
  }
}

async function createStatesAndCountries() {
  const countries = countryState.getAll();
  for (const countryKey in countries) {
    const __SQL_TRANSACTION = await sequelize.transaction();

    try {
      const country = countries[countryKey]; //country_name = country.name
      const isCountryAvailable = await Country.findOne({
        where: { country_name: country.name },
      });

      if (isCountryAvailable) {
        await Country.update(
          { abbrevation: countryKey },
          {
            where: { id: isCountryAvailable.id },
            transaction: __SQL_TRANSACTION,
          }
        );
        await __SQL_TRANSACTION.commit();
        continue;
      }

      const country_name = country.name;
      const currency = country.currency.split(",", 0)[0]
        ? country.currency.split(",", 0)[0]
        : country.currency.split(",", 1)[0];
      const phone_code = country.phone.split(",")[0]
        ? country.phone.split(",")[0]
        : country.phone.split(",")[1];

      const __COUNTRY = await Country.create(
        {
          country_name,
          phone_code,
          currency,
          abbrevation: countryKey,
          status: "active",
        },
        { transaction: __SQL_TRANSACTION }
      );
      // add country over here
      for (const state in country.states) {
        const __STATE = await State.create(
          { country_id: __COUNTRY.id, state_name: state, status: "active" },
          { transaction: __SQL_TRANSACTION }
        );
      }
      await __SQL_TRANSACTION.commit();
    } catch (err) {
      const country = countries[countryKey];
      const country_name = country.name;
      const currency = country.currency.split(",", 0)[0]
        ? country.currency.split(",", 0)[0]
        : country.currency.split(",", 1)[0];
      const phone_code = country.phone.split(",")[0]
        ? country.phone.split(",")[0]
        : country.phone.split(",")[1];

      await __SQL_TRANSACTION.rollback();
    }
  }
}

async function createDemoProofs() {
  try {
    const proofTypes = config.proof_types;
    for (const pt of proofTypes) {
      const __PROOF_TYPE = await CommonController.upsert(ProofType, pt, {
        proof_name: pt.proof_name,
      });
    }
  } catch (err) {
    throw err;
  }
}

async function createQuantities() {
  try {
    const quantityTypes = config.quantity_types;
    for (const qt of quantityTypes) {
      const __QUANTITY_TYPE = await CommonController.upsert(QuantityType, qt, {
        quantity_type_name: qt.quantity_type_name,
      });
    }
  } catch (err) {
    throw err;
  }
}

async function createDeliveryServices() {
  try {
    const deliveryServices = config.delivery_services;
    for (const ds of deliveryServices) {
      const __DELIVERY_SERVICES = await CommonController.upsert(
        DeliveryService,
        ds,
        { delivery_service_name: ds.delivery_service_name }
      );
    }
  } catch (err) {
    throw err;
  }
}

const createDefaultOrderServiceCharge = async function () {
  try {
    const orderServiceCharge = config.order_item_service_charge;
    const __ORDER_ITEM_SERVICE_CHARGE = await OrderServiceCharge.findOne({
      where: { status: "active" },
    });

    if (!__ORDER_ITEM_SERVICE_CHARGE) {
      await OrderServiceCharge.create(orderServiceCharge);
    }
  } catch (err) {
    throw err;
  }
};

const createOrderStatuses = async function () {
  const orderStatusList = config.order_statuses;
  for (let i = 0; i < orderStatusList.length; i++) {
    await CommonController.upsert(OrderStatus, orderStatusList[i], {
      order_status_name: orderStatusList[i].order_status_name,
    });
  }
};

const createPaymentServices = async function () {
  try {
    const paymentServices = config.payment_services;
    for (const ps of paymentServices) {
      const __PAYMENT_SERVICES = await CommonController.upsert(
        PaymentService,
        ps,
        { payment_service_name: ps.payment_service_name }
      );
    }
  } catch (err) {
    throw err;
  }
};

const createDefaultStoreServiceCharge = async function () {
  try {
    const storeServiceCharge = config.store_service_charge;
    const __SERVICE_CHARGE = await StoreServiceCharge.findOne({
      where: { status: "active" },
    });

    if (!__SERVICE_CHARGE) {
      await StoreServiceCharge.create(storeServiceCharge);
    }
  } catch (err) {
    throw err;
  }
};

const createMembershipPlans = async function () {
  try {
    const membershipPlans = config.membersip_plans;
    for (const mp of membershipPlans) {
      const __MEMBERSHIP_PLAN = await MembershipPlan.findOne({
        where: { plan_type: mp.plan_type },
      });
      if (!__MEMBERSHIP_PLAN) {
        await MembershipPlan.create(mp);
      }
    }
  } catch (err) {
    throw err;
  }
};

const createDefaultTax = async function () {
  try {
    const tax = config.tax;

    // logger.log(tax)

    let __TAX = await Tax.findOne({ where: { status: "active" } });
    if (!__TAX) {
      __TAX = await Tax.create({
        tax_type: tax.tax_type,
        tax_value: tax.tax_value,
        stripe_enabled_tax: true,
        status: "active",
      });
      // logger.log(__TAX.toJSON())
    }
  } catch (err) {
    throw err;
  }
};

// createDefaultTax()

const createDefaultRoles = async function () {
  try {
    const defaultRoles = config.deafult_roles;
    for (const mp of defaultRoles) {
      const __DEFAULT_ROLE = await DefaultRole.findOne({
        where: { role_name: mp.role_name },
      });
      if (!__DEFAULT_ROLE) {
        await DefaultRole.create(mp);
      }
    }
  } catch (err) {
    throw err;
  }
};

const createDefaultAdmin = async function () {
  try {
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL,
      password: "Password@123",
      name: "Admin",
      status: "active",
    });
  } catch (err) {
    console.error(err?.message);
  }
};

async function createData() {
  await createModuleAndControllers();
  await createOrderStatuses();
  await createStatesAndCountries();
  await createDemoProofs();
  await createQuantities();
  await createDeliveryServices();
  await createDefaultOrderServiceCharge();
  await createPaymentServices();
  await createDefaultStoreServiceCharge();
  await createMembershipPlans();
  await createDefaultTax();
  await createDefaultRoles();
  await createDefaultAdmin();
}

module.exports = createData;
