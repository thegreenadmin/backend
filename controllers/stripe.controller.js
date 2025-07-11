require("custom-env").env(true);

const sequelize = global["sequelize"];
var moment = require("moment");
const { Op } = require("sequelize");

const logger = require("../logger/logger");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const StoreStripeAccount = require("../models/store/store_stripe_account.model");
const StoreStripeBankAccount = require("../models/store/store_stripe_bank_account.model");
const StoreUser = require("../models/store/store_users.model");
const PaymentService = require("../models/transaction/payment_service.model");
const StorePayout = require("../models/transaction/store_payout.model");
const StoreTransfer = require("../models/transaction/store_transfer.model");
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model");
const Transaction = require("../models/transaction/transaction.model");
const TransactionHistory = require("../models/transaction/transaction_history.model");
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model");
const User = require("../models/user/user.model");
const UserAddress = require("../models/user/user_address.model");
const UserStripe = require("../models/user/user_stripe.model");
const UserStripeBank = require("../models/user/user_stripe_bank.model");
const UserStripeCard = require("../models/user/user_stripe_card.model");
const { timeout } = require("../utils/helper.utils");
const { sendConflictResponse } = require("../utils/response.util");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const getStripeUser = async function (user_id, throwErr = true) {
  try {
    const __STRIPE_USER = await UserStripe.findOne({
      where: { user_id, status: "active" },
    });
    if (!__STRIPE_USER && throwErr) {
      throw "Stripe account not exists";
    }
    return __STRIPE_USER;
  } catch (err) {
    throw err;
  }
};

const createStripeUser = async function (data, user_id) {
  // data = {user_address_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { user_address_id } = data;

    const __USER_STRIPE_EXISTS = await UserStripe.findOne({
      where: { user_id, status: "active" },
    });

    if (__USER_STRIPE_EXISTS) {
      throw "User wallet account exists";
    }

    const __USER = await User.findOne({ where: { id: user_id } });

    const __USER_ADDRESS = user_address_id
      ? await UserAddress.findOne({
          where: { id: user_address_id, user_id, status: "active" },
        })
      : null;

    const __STATE = user_address_id
      ? await State.findOne({ where: { id: __USER_ADDRESS.state_id } })
      : null;
    const __COUNTRY = user_address_id
      ? await Country.findOne({ where: { id: __STATE.country_id } })
      : null;

    const address = user_address_id
      ? {
          address: {
            line1: __USER_ADDRESS.address_line_1,
            line2: __USER_ADDRESS.address_line_2,
            city: __USER_ADDRESS.city,
            state: __STATE.state_name,
            country: __COUNTRY.abbrevation,
            postal_code: __USER_ADDRESS.postal_code,
          },
        }
      : {};

    const __STRIPE_CUSTOMER = await stripe.customers.create({
      name: `${__USER.first_name} ${__USER.last_name}`,
      email: __USER.email,
      phone: __USER.phone,
      ...address,
      metadata: {
        user_id: __USER.id,
        NODE_ENV: process.env.NODE_ENV,
      },
    });

    const __USER_STRIPE = await UserStripe.create(
      {
        user_id,
        user_address_id: __USER_ADDRESS ? __USER_ADDRESS.id : null,
        stripe_customer_id: __STRIPE_CUSTOMER.id,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    await __SQL_TRANSACTION.commit();
    return { user_stripe_id: __USER_STRIPE.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const createUserStripeCard = async function (data, user_id) {
  // data = {token_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { token_id } = data;
    let __USER_STRIPE = await getStripeUser(user_id, false);

    if (!__USER_STRIPE) {
      const __USER_ADDRESS = await UserAddress.findOne({
        where: { user_id, status: "active" },
      });

      await createStripeUser(
        { user_address_id: __USER_ADDRESS ? __USER_ADDRESS.id : null },
        user_id
      );
      __USER_STRIPE = await getStripeUser(user_id);
    }

    const card = await stripe.customers.createSource(
      __USER_STRIPE.stripe_customer_id,
      {
        source: token_id,
        metadata: {
          NODE_ENV: process.env.NODE_ENV,
          user_id,
        },
      }
    );

    const __USER_STRIPE_CARD = await UserStripeCard.create(
      {
        user_stripe_id: __USER_STRIPE.id,
        stripe_card_id: card.id,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    await __SQL_TRANSACTION.commit();

    return { user_stripe_card_id: __USER_STRIPE_CARD.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const listUserCards = async function (user_id) {
  try {
    const __USER_STRIPE = await getStripeUser(user_id, false);

    if (!__USER_STRIPE) {
      return { cards: [] };
    }

    const __USER_STRIPE_CARDS = await UserStripeCard.findAll({
      where: { user_stripe_id: __USER_STRIPE.id, status: "active" },
      attributes: {
        include: [["id", "user_stripe_card_id"]],
        exclude: ["id"],
      },
    });
    const cards = await stripe.customers.listSources(
      __USER_STRIPE.stripe_customer_id
    );

    return {
      cards: __USER_STRIPE_CARDS
        ?.map((usc) => {
          usc = usc.toJSON();
          usc.card = cards.data.find((c) => c.id == usc.stripe_card_id);
          return usc;
        })
        ?.filter((data) => Object.keys(data?.card || {}).length > 0),
    };
  } catch (err) {
    throw err;
  }
};

const deleteUserStripeCard = async function (data, user_id) {
  // data = {user_stripe_card_id}
  try {
    const { user_stripe_card_id } = data;
    const __USER_STRIPE = await getStripeUser(user_id);
    const __USER_STRIPE_CARD = await UserStripeCard.findOne({
      where: {
        id: user_stripe_card_id,
        user_stripe_id: __USER_STRIPE.id,
        status: "active",
      },
    });

    if (!__USER_STRIPE_CARD) {
      throw "Card not found";
    }

    const __DELETE_STRIPE_CARDS = await UserStripeCard.update(
      {
        status: "deleted",
      },
      {
        where: { id: __USER_STRIPE_CARD.id },
      }
    );

    const deleteCard = await stripe.customers.deleteSource(
      __USER_STRIPE.stripe_customer_id,
      __USER_STRIPE_CARD.stripe_card_id
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const userWalletRechargeWithCard = async function (
  data,
  user_id,
  user_wallet_auto_charge_id = null
) {
  // data = {user_stripe_card_id, amount}

  try {
    const { user_stripe_card_id, amount } = data;
    const __STRIPE_PAYMENT_SERVICE =
      await CommonController.getStripePaymentService();

    const __STRIPE_CARD = await UserStripeCard.findOne({
      where: { id: user_stripe_card_id, status: "active" },
      include: [
        {
          model: UserStripe,
          where: { user_id, status: "active" },
        },
      ],
    });

    if (!__STRIPE_CARD) {
      throw "Card not found";
    }

    const __TRANSACTION = await Transaction.create({
      payment_service_id: __STRIPE_PAYMENT_SERVICE.id,
      transaction_type: "credit",
      transaction_amount: amount,
      status: "active",
    });

    const __TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "pending",
      status: "active",
    });

    let paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount * 100),
      currency: "usd",
      confirm: true,
      customer: __STRIPE_CARD.user_stripe.stripe_customer_id,
      payment_method: __STRIPE_CARD.stripe_card_id,
      metadata: {
        transaction_id: __TRANSACTION.id,
        user_id,
        user_stripe_card_id,
        user_wallet_auto_charge_id,
        NODE_ENV: process.env.NODE_ENV,
      },
    });

    if (paymentIntent) {
      // update the stripe_transaction_id into the transaction
      await Transaction.update(
        {
          stripe_payment_intent_transaction_id: paymentIntent.id,
        },
        {
          where: { id: __TRANSACTION.id },
        }
      );

      // logger.log(paymentIntent)

      if (paymentIntent.status != "succeeded") {
        await timeout(5000);
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
        if (paymentIntent.status == "requires_action") {
          paymentIntent = await stripe.paymentIntents.cancel(paymentIntent.id);
        }

        if (paymentIntent.amount_received <= 0) {
          throw "Payment failed";
        }
      } else {
        const __IS_TRANSACTION_ALREADY_UPDATED =
          await UserWalletTransactions.findOne({
            where: {
              transaction_id: __TRANSACTION.id,
            },
          });

        if (!__IS_TRANSACTION_ALREADY_UPDATED) {
          const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create(
            {
              transaction_id: __TRANSACTION.id,
              transaction_status: "success",
              status: "active",
            }
          );

          const __USER_BALANCE = await CommonController.getUserCurrentBalance(
            user_id
          );

          const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create(
            {
              transaction_id: __TRANSACTION.id,
              user_id,
              user_stripe_card_id: user_stripe_card_id
                ? user_stripe_card_id
                : null,
              user_wallet_auto_charge_id: null,
              net_balance: __USER_BALANCE + parseFloat(amount),
              status: "active",
            }
          );

          await User.update(
            { user_balance: __USER_BALANCE + parseFloat(amount) },
            { where: { id: user_id } }
          );
        }
      }
    }

    return {
      transaction_id: __TRANSACTION.id,
      amount,
      status: paymentIntent.status,
    };
  } catch (err) {
    throw err;
  }
};

const storeWalletRechargeWithCard = async function (data, user_id) {
  // data = {user_stripe_card_id, amount, store_id}

  try {
    const { user_stripe_card_id, store_id, amount } = data;
    const __STRIPE_PAYMENT_SERVICE =
      await CommonController.getStripePaymentService();

    const __STORE = await Store.findOne({
      where: {
        id: store_id,
      },
      include: [
        {
          model: StoreUser,
          where: { user_id, is_store_owner: true },
          required: true,
        },
      ],
    });

    if (!__STORE) {
      throw "Only store owner can add funds.";
    }

    const __STRIPE_CARD = await UserStripeCard.findOne({
      where: { id: user_stripe_card_id, status: "active" },
      include: [
        {
          model: UserStripe,
          where: { user_id, status: "active" },
        },
      ],
    });

    if (!__STRIPE_CARD) {
      throw "Card not found";
    }

    const __TRANSACTION = await Transaction.create({
      payment_service_id: __STRIPE_PAYMENT_SERVICE.id,
      transaction_type: "credit",
      transaction_amount: amount,
      status: "active",
    });

    const __TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "pending",
      status: "active",
    });

    let paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount * 100),
      currency: "usd",
      confirm: true,
      customer: __STRIPE_CARD.user_stripe.stripe_customer_id,
      payment_method: __STRIPE_CARD.stripe_card_id,
      metadata: {
        transaction_id: __TRANSACTION.id,
        store_id,
        user_id,
        user_stripe_card_id,
        NODE_ENV: process.env.NODE_ENV,
      },
    });

    if (paymentIntent) {
      // update the stripe_transaction_id into the transaction
      await Transaction.update(
        {
          stripe_payment_intent_transaction_id: paymentIntent.id,
        },
        {
          where: { id: __TRANSACTION.id },
        }
      );

      // logger.log(paymentIntent)

      if (paymentIntent.status != "succeeded") {
        await timeout(5000);
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
        if (paymentIntent.status == "requires_action") {
          paymentIntent = await stripe.paymentIntents.cancel(paymentIntent.id);
        }

        if (paymentIntent.amount_received <= 0) {
          throw "Payment failed";
        }
      } else {
        const __IS_TRANSACTION_ALREADY_UPDATED =
          await StoreWalletTransaction.findOne({
            where: {
              transaction_id: __TRANSACTION.id,
            },
          });

        if (!__IS_TRANSACTION_ALREADY_UPDATED) {
          const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create(
            {
              transaction_id: __TRANSACTION.id,
              transaction_status: "success",
              status: "active",
            }
          );

          const __STORE_BALANCE = await CommonController.getStoreBalance(
            store_id
          );

          const __STORE_WALLET_TRANSACTION =
            await StoreWalletTransaction.create({
              store_id,
              transaction_id: __TRANSACTION.id,
              user_id,
              user_stripe_card_id: user_stripe_card_id
                ? user_stripe_card_id
                : null,
              net_balance: __STORE_BALANCE + parseFloat(amount),
              status: "active",
            });

          await Store.update(
            { store_balance: __STORE_BALANCE + parseFloat(amount) },
            { where: { id: store_id } }
          );
        }
      }
    }

    return {
      transaction_id: __TRANSACTION.id,
      amount,
      status: paymentIntent.status,
    };
  } catch (err) {
    throw err;
  }
};

const createUserWalletRechargeWithApplePayOrGooglePay = async function (
  data,
  user_id
) {
  // data = {payment_service_name, amount}
  try {
    const { payment_service_name, amount } = data;
    const __PAYMENT_SERVICE = await PaymentService.findOne({
      where: { payment_service_name: { [Op.iLike]: payment_service_name } },
    });

    const __USER_STRIPE = await getStripeUser(user_id, false);

    const __TRANSACTION = await Transaction.create({
      payment_service_id: __PAYMENT_SERVICE.id,
      transaction_type: "credit",
      transaction_amount: amount,
      status: "active",
    });

    const __TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "pending",
      status: "active",
    });

    let paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: "usd",
      confirm: true,
      customer: __USER_STRIPE.stripe_customer_id,
      metadata: {
        transaction_id: __TRANSACTION.id,
        user_id,
        user_stripe_card_id: null,
        user_wallet_auto_charge_id: null,
        NODE_ENV: process.env.NODE_ENV,
      },
    });

    if (paymentIntent) {
      await Transaction.update(
        {
          stripe_payment_intent_transaction_id: paymentIntent.id,
        },
        {
          where: { id: __TRANSACTION.id },
        }
      );
    }

    return {
      payment_intent: paymentIntent,
    };
  } catch (err) {
    throw err;
  }
};

const createUserStripeBankAccount = async function (data, user_id) {
  // data = {token_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { token_id } = data;
    let __USER_STRIPE = await getStripeUser(user_id, false);

    if (!__USER_STRIPE) {
      const __USER_ADDRESS = await UserAddress.findOne({
        where: { user_id, status: "active" },
      });

      await createStripeUser(
        { user_address_id: __USER_ADDRESS ? __USER_ADDRESS.id : null },
        user_id
      );
      __USER_STRIPE = await getStripeUser(user_id);
    }

    if (!__USER_STRIPE.stripe_connected_account_id) {
      const __USER = await User.findOne({ where: { id: user_id } });
      const stripeConnectedAccount = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: __USER.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          NODE_ENV: process.env.NODE_ENV,
          user_id,
        },
      });

      await UserStripe.update(
        { stripe_connected_account_id: stripeConnectedAccount.id },
        { where: { id: __USER_STRIPE.id } }
      );

      __USER_STRIPE = await getStripeUser(user_id);
    }

    const account = await stripe.accounts.retrieve(
      __USER_STRIPE.stripe_connected_account_id
    );

    if (account.capabilities.transfers != "active") {
      throw "Your account is not verified. Please wait until it is verified.";
    }

    const bank = await stripe.accounts.createExternalAccount(
      __USER_STRIPE.stripe_connected_account_id,
      {
        external_account: token_id,
        metadata: {
          NODE_ENV: process.env.NODE_ENV,
          user_id,
        },
      }
    );

    const __USER_STRIPE_BANK = await UserStripeBank.create(
      {
        user_stripe_id: __USER_STRIPE.id,
        stripe_bank_id: bank.id,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    await __SQL_TRANSACTION.commit();

    return { stripe_bank_id: __USER_STRIPE_BANK.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const listUserBankAccounts = async function (user_id) {
  try {
    const __USER_STRIPE = await getStripeUser(user_id, false);
    if (!__USER_STRIPE || !__USER_STRIPE.stripe_connected_account_id) {
      return { banks: [] };
    }

    let __USER_STRIPE_BANKS = await UserStripeBank.findAll({
      where: { user_stripe_id: __USER_STRIPE.id, status: "active" },
      attributes: {
        include: [["id", "user_stripe_bank_id"]],
        exclude: ["id"],
      },
    });

    const banks = await stripe.accounts.listExternalAccounts(
      __USER_STRIPE.stripe_connected_account_id,
      { object: "bank_account" }
    );

    const __NON_REGISTERED_BANKS = banks.data.filter((c) => {
      let isBankExists = false;
      __USER_STRIPE_BANKS.forEach((usb) => {
        isBankExists = !isBankExists
          ? usb.stripe_bank_id == c.id
          : isBankExists;
      });
      return !isBankExists;
    });

    if (__NON_REGISTERED_BANKS.length) {
      const __USER_STRIPE_BANK = await UserStripeBank.bulkCreate(
        __NON_REGISTERED_BANKS.map((nrb) => {
          return {
            user_stripe_id: __USER_STRIPE.id,
            stripe_bank_id: nrb.id,
            status: "active",
          };
        })
      );

      __USER_STRIPE_BANKS = await UserStripeBank.findAll({
        where: { user_stripe_id: __USER_STRIPE.id, status: "active" },
        attributes: {
          include: [["id", "user_stripe_bank_id"]],
          exclude: ["id"],
        },
      });
    }

    return {
      banks: __USER_STRIPE_BANKS
        .map((usc) => {
          usc = usc.toJSON();
          usc.bank = banks.data.find((c) => c.id == usc.stripe_bank_id);
          return usc;
        })
        .filter((usc) => usc.bank),
    };
  } catch (err) {
    throw err;
  }
};

const deleteUserBankAccount = async function (data, user_id) {
  // data = {user_stripe_bank_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { user_stripe_bank_id } = data;
    const __USER_STRIPE = await getStripeUser(user_id);
    const __USER_STRIPE_BANK = await UserStripeBank.findOne({
      where: {
        id: user_stripe_bank_id,
        user_stripe_id: __USER_STRIPE.id,
        status: "active",
      },
    });

    if (!__USER_STRIPE_BANK) {
      throw "Bank not found";
    }

    const __DELETE_STRIPE_CARDS = await UserStripeBank.update(
      {
        status: "deleted",
      },
      {
        where: { id: __USER_STRIPE_BANK.id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const deleted = await stripe.accounts.deleteExternalAccount(
      __USER_STRIPE.stripe_connected_account_id,
      __USER_STRIPE_BANK.stripe_bank_id
    );

    await __SQL_TRANSACTION.commit();

    return { is_deleted: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

//store
//store
//store
//store
//store
//store
//store

const getUserStripeConnectedAccount = async function (user_id) {
  try {
    let __USER_STRIPE = await getStripeUser(user_id, false);
    const __USER = await User.findOne({ where: { id: user_id } });

    if (!__USER_STRIPE) {
      const __USER_ADDRESS = await UserAddress.findOne({
        where: { user_id, status: "active" },
      });

      await createStripeUser(
        { user_address_id: __USER_ADDRESS ? __USER_ADDRESS.id : null },
        user_id
      );
      __USER_STRIPE = await getStripeUser(user_id);
    }

    if (!__USER_STRIPE.stripe_connected_account_id) {
      const stripeConnectedAccount = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: __USER.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        }        
      });

      await stripe.accounts.update(stripeConnectedAccount.id, {
        settings: {
          payouts: {
            schedule: {
              interval: "manual",
            },
          },
        },
      });

      await UserStripe.update(
        { stripe_connected_account_id: stripeConnectedAccount.id },
        { where: { id: __USER_STRIPE.id } }
      );

      __USER_STRIPE = await getStripeUser(user_id);
    }

    const account = await stripe.accounts.retrieve(
      __USER_STRIPE.stripe_connected_account_id
    );

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.ENV_DOMAIN}/stripe?messageType=refresh`,
      return_url: `${process.env.ENV_DOMAIN}/stripe?messageType=return`,
      type: "account_onboarding",
      locale: "en", // ✅ Supported locales like 'en', 'fr', 'de', etc.
    });

    return {
      account,
      accountLink,
    };
  } catch (err) {
    throw err;
  }
};

const stripeDocumentUpload = async function (file, file_type) {
  try {
    const fileName = `${Math.floor(
      Math.random() * 1000000000000
    )}-${file.originalname
      .replace(/ /g, "-")
      .replace(/\(/g, "")
      .replace(/\)/g, "")}`;
    const upload = await stripe.files.create({
      file: {
        data: file.buffer,
        name: fileName,
        type: "application.octet-stream",
      },
      purpose: file_type,
    });

    return upload;
  } catch (err) {
    throw err;
  }
};

const createStoreStripeAccount = async function (data, ip) {
  // data = {store_id}
  try {
    const { store_id } = data;

    const __STRIPE_ACCOUNT_EXISTS = await getStoreStripeAccount(
      store_id,
      false
    );

    if (__STRIPE_ACCOUNT_EXISTS) {
      throw "Store stripe account already exists";
    }

    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });

    const stripeAccount = await stripe.accounts.create({
      type: "standard",
      metadata: {
        NODE_ENV: process.env.NODE_ENV,
        store_id,
      },
    });

    const __STORE_STRIPE_ACCOUNT = await StoreStripeAccount.create({
      store_id,
      stripe_account_id: stripeAccount.id,
      status: "active",
    });

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: process.env.ENV_DOMAIN + "/webview/close",
      return_url: process.env.ENV_DOMAIN + "/webview/close",
      type: "account_onboarding",
    });

    return {
      store_stripe_account_id: __STORE_STRIPE_ACCOUNT.id,
      link: accountLink.url,
    };
  } catch (err) {
    throw err;
  }
};

const getStoreStripeAccount = async function (store_id, throwErr = true) {
  try {
    const __STORE_STRIPE_ACCOUNT = await StoreStripeAccount.findOne({
      where: { store_id, status: "active" },
    });

    if (!__STORE_STRIPE_ACCOUNT && throwErr) {
      throw "Store stripe account not found";
    }

    return __STORE_STRIPE_ACCOUNT;
  } catch (err) {
    throw err;
  }
};

const getStoreConnectedAccount = async function (data) {
  // data = {store_id}
  try {
    const { store_id } = data;
    const __STORE_STRIPE_ACCOUNT = await getStoreStripeAccount(store_id);

    const account = await stripe.accounts.retrieve(
      __STORE_STRIPE_ACCOUNT.stripe_account_id
    );

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.ENV_DOMAIN + "/webview/close",
      return_url: process.env.ENV_DOMAIN + "/webview/close",
      type: "account_onboarding",
    });

    return {
      store_stripe_account_id: __STORE_STRIPE_ACCOUNT.id,
      stripe_account: account,
      url: accountLink.url,
    };
  } catch (err) {
    throw err;
  }
};

const createStoreStripeBankAccount = async function (data, ip) {
  // data = {store_id, bank_token_id}
  try {
    const { store_id, bank_token_id } = data;
    let __STORE_STRIPE_ACCOUNT = await getStoreStripeAccount(store_id, false);
    if (!__STORE_STRIPE_ACCOUNT) {
      const __STORE_ADDRESS = await StoreAddress.findOne({
        where: { store_id, status: "active" },
      });

      if (!__STORE_ADDRESS) {
        throw "Please add store address to process";
      }

      await createStoreStripeAccount(
        { store_id, store_address_id: __STORE_ADDRESS.id },
        ip
      );
      __STORE_STRIPE_ACCOUNT = await getStoreStripeAccount(store_id);
    }

    const bankAccount = await stripe.accounts.createExternalAccount(
      __STORE_STRIPE_ACCOUNT.stripe_account_id,
      {
        external_account: bank_token_id,
      }
    );

    const __STORE_STRIPE_BANK_ACCOUNT = await StoreStripeBankAccount.create({
      store_stripe_account_id: __STORE_STRIPE_ACCOUNT.id,
      stripe_bank_account_id: bankAccount.id,
      status: "active",
    });

    return { store_stripe_bank_account_id: __STORE_STRIPE_BANK_ACCOUNT.id };
  } catch (err) {
    throw err;
  }
};

const createStripePayout = async function (data, user_id) {
  // data = {store_id, amount, user_stripe_bank_id}
  let storeId, userStripeBankId, store_wallet_transaction_id, transaction_id;
  try {
    const { store_id, amount, user_stripe_bank_id } = data;

    if (typeof amount !== "number") {
      throw "Entered amount could not be in decimal";
    }

    let __USER_STRIPE = await getStripeUser(user_id, false);

    if (!__USER_STRIPE.stripe_connected_account_id) {
      throw "Account is not verified, please verify it once";
    }

    const account = await stripe.accounts.retrieve(
      __USER_STRIPE.stripe_connected_account_id
    );

    if (account.capabilities.transfers != "active") {
      throw "Account is not verified, please wait untill it is verified";
    }

    storeId = storeId;
    userStripeBankId = user_stripe_bank_id;
    // throw await stripe.balance.retrieve();

    const __STORE_ADMIN = await CommonController.getStoreOwnerUser(store_id);
    if (__STORE_ADMIN.id != user_id) {
      throw "Something went wrong";
    }

    const __USER_STRIPE_BANK = await UserStripeBank.findOne({
      where: { id: user_stripe_bank_id },
      include: [
        {
          model: UserStripe,
          where: { user_id, status: "active" },
        },
      ],
    });

    if (!__USER_STRIPE_BANK) {
      throw "Bank not found";
    }

    const __STORE_SERVICE_CHARGE = await CommonController.getStoreServiceCharge(
      store_id
    );

    const storeBalance = await CommonController.getStoreBalance(store_id);

    const totalAmount = amount;
    const newStoreBalance =
      (storeBalance - totalAmount).toFixed(2) == 0
        ? 0
        : storeBalance - totalAmount;
    const stripeBalance = await stripe.balance.retrieve();

    const __STRIPE_PAYOUT_PAYMENT_SERVICE =
      await CommonController.getStripeTransferPaymentService();

    if (totalAmount > storeBalance) {
      throw "Not enough balance";
    }

    if (
      !stripeBalance ||
      !stripeBalance.available.length ||
      totalAmount * 100 > stripeBalance.available[0].amount
    ) {
      throw "Payment service is down, please try after sometime";
    }

    const __TRANSACTION = await Transaction.create({
      payment_service_id: __STRIPE_PAYOUT_PAYMENT_SERVICE.id,
      transaction_type: "payout",
      transaction_amount: totalAmount,
      status: "active",
    });

    transaction_id = __TRANSACTION.id;

    const __TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "pending",
      status: "active",
    });

    const __STORE_PAYOUT = await StorePayout.create({
      transaction_id: __TRANSACTION.id,
      store_id: store_id,
      user_stripe_bank_id,
      transfered_amount: amount,
      total_transaction_amount: totalAmount,
      reversed_amount: 0,
      total_reversed_amount: 0,
      status: "active",
      payout_type: "transfered",
    });

    const __STORE_WALLET_TRANASACTION = await StoreWalletTransaction.create({
      store_id,
      store_payout_id: __STORE_PAYOUT.id,
      net_balance: newStoreBalance,
      status: "active",
    });

    await Store.update(
      { store_balance: newStoreBalance },
      { where: { id: store_id } }
    );

    store_wallet_transaction_id = __STORE_WALLET_TRANASACTION.id;
    const transfer = await stripe.transfers.create({
      amount: parseInt(amount * 100),
      currency: "usd",
      destination: __USER_STRIPE.stripe_connected_account_id,
      metadata: {
        NODE_ENV: process.env.NODE_ENV,
        user_id,
        store_id,
        store_wallet_transaction_id: __STORE_WALLET_TRANASACTION.id,
        user_stripe_bank_id,
        transaction_id: __TRANSACTION.id,
      },
    });

    if (transfer) {
      await StorePayout.update(
        { stripe_transfer_id: transfer.id },
        { where: { id: __STORE_PAYOUT.id } }
      );
    }

    await timeout(2000);

    const payout = await stripe.payouts.create(
      {
        amount: parseInt(amount * 100), // Amount in cents
        currency: "usd",
        destination: __USER_STRIPE_BANK.stripe_bank_id,
        method: "standard",
        metadata: {
          NODE_ENV: process.env.NODE_ENV,
          user_id,
          store_id,
          store_wallet_transaction_id: __STORE_WALLET_TRANASACTION.id,
          user_stripe_bank_id,
          transaction_id: __TRANSACTION.id,
          transfer_id: transfer.id,
        },
      },
      {
        stripeAccount: __USER_STRIPE.stripe_connected_account_id,
      }
    );

    if (payout) {
      await Transaction.update(
        { stripe_payout_transaction_id: payout.id },
        { where: { id: __TRANSACTION.id } }
      );
      await StorePayout.update(
        { stripe_payout_id: payout.id },
        { where: { id: __STORE_PAYOUT.id } }
      );
    }

    return { store_payout_id: __STORE_PAYOUT.id };
  } catch (err) {
    if (
      (storeId, userStripeBankId, store_wallet_transaction_id, transaction_id)
    ) {
      try {
        returnStripePayout({
          user_id,
          store_id: data.store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id: userStripeBankId,
          transaction_id,
        });
      } catch (err) {
        // logger.log(err)
      }
    }

    throw err;
  }
};

const returnStripePayout = async function (data) {
  // data = {user_id, store_id, store_wallet_transaction_id, user_stripe_bank_id, transaction_id}
  try {
    const {
      user_id,
      store_id,
      store_wallet_transaction_id,
      user_stripe_bank_id,
      transaction_id,
    } = data;

    const __STORE_WALLET_TRANASACTION = await StoreWalletTransaction.findOne({
      where: { id: store_wallet_transaction_id },
      include: [
        {
          model: StorePayout,
        },
      ],
    });

    const __STORE_PAYOUT = __STORE_WALLET_TRANASACTION.store_payout;
    const __USER_STRIPE = await UserStripe.findOne({
      where: { user_id, status: "active" },
    });

    if (__STORE_PAYOUT.stripe_payout_id) {
      const stripePayout = await stripe.payouts.retrieve(
        __STORE_PAYOUT.stripe_payout_id,
        {
          stripeAccount: __USER_STRIPE.stripe_connected_account_id,
        }
      );

      if (stripePayout.status != "failed") {
        return;
      }
    }

    const reversal = await stripe.transfers.createReversal(
      __STORE_PAYOUT.stripe_transfer_id
    );
    if (!reversal) {
      return;
    }

    const __STRIPE_PAYOUT_PAYMENT_SERVICE =
      await CommonController.getStripeTransferPaymentService();

    const __FAILED_TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __STORE_PAYOUT.transaction_id,
      transaction_status: "failed",
      status: "active",
    });

    const __TRANSACTION = await Transaction.create({
      payment_service_id: __STRIPE_PAYOUT_PAYMENT_SERVICE.id,
      transaction_type: "payout refund",
      transaction_amount: __STORE_PAYOUT.total_transaction_amount,
      status: "active",
    });

    const __TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "pending",
      status: "active",
    });

    const __CREDIT_STORE_PAYOUT = await StorePayout.create({
      transaction_id: __TRANSACTION.id,
      store_id: store_id,
      user_stripe_bank_id,
      transfered_amount: 0,
      total_transaction_amount: 0,
      reversed_amount: __STORE_PAYOUT.transfered_amount,
      total_reversed_amount: __STORE_PAYOUT.total_transaction_amount,
      status: "active",
      payout_type: "reversed",
    });

    const storeBalance = await CommonController.getStoreBalance(store_id);
    const newStoreBalance =
      storeBalance + __STORE_PAYOUT.total_transaction_amount;

    const __CREDIT_STORE_WALLET_TRANASACTION =
      await StoreWalletTransaction.create({
        store_id,
        store_payout_id: __CREDIT_STORE_PAYOUT.id,
        net_balance: newStoreBalance,
        status: "active",
      });

    await Store.update(
      { store_balance: newStoreBalance },
      { where: { id: store_id } }
    );

    const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
      transaction_id: __TRANSACTION.id,
      transaction_status: "success",
      status: "active",
    });

    // now update that payout is completed
    await StorePayout.update(
      { stripe_transfer_id: reversal.id },
      { where: { id: __CREDIT_STORE_PAYOUT.id } }
    );
    await StorePayout.update(
      { is_reversed: true },
      { where: { id: __STORE_PAYOUT.id } }
    );
  } catch (err) {
    throw err;
  }
};

const stripeWebHook = async function (data, sig = "") {
  const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
  try {
    const event = stripe.webhooks.constructEvent(data, sig, endpointSecret);
    await timeout(5000);
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntentSucceeded = event.data.object;
        const {
          transaction_id,
          user_id,
          user_stripe_card_id,
          NODE_ENV,
          user_wallet_auto_charge_id,
          store_id,
        } = event.data.object.metadata;

        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );

        if (store_id) {
          // code here with respect to store wallet recharge
          const __IS_TRANSACTION_ALREADY_UPDATED =
            await StoreWalletTransaction.findOne({
              where: {
                transaction_id: transaction_id,
              },
            });

          if (!__IS_TRANSACTION_ALREADY_UPDATED) {
            const amount = event.data.object.amount / 100;
            const __SUCCESS_TRANSACTION_HISTORY =
              await TransactionHistory.create({
                transaction_id: transaction_id,
                transaction_status: "success",
                status: "active",
              });

            const __STORE_BALANCE = await CommonController.getStoreBalance(
              store_id
            );

            const __STORE_WALLET_TRANSACTION =
              await StoreWalletTransaction.create({
                transaction_id: transaction_id,
                store_id,
                user_id,
                user_stripe_card_id: user_stripe_card_id
                  ? user_stripe_card_id
                  : null,
                net_balance: __STORE_BALANCE + parseFloat(amount),
                status: "active",
              });

            await Store.update(
              { store_balance: __STORE_BALANCE + parseFloat(amount) },
              { where: { id: store_id } }
            );
          }
        } else {
          const __IS_TRANSACTION_ALREADY_UPDATED =
            await UserWalletTransactions.findOne({
              where: {
                transaction_id,
              },
            });

          if (__IS_TRANSACTION_ALREADY_UPDATED) {
            return;
          }

          const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create(
            { transaction_id, transaction_status: "success", status: "active" }
          );
          const __USER_BALANCE = await CommonController.getUserCurrentBalance(
            user_id
          );
          const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create(
            {
              transaction_id,
              user_id,
              user_stripe_card_id: user_stripe_card_id
                ? user_stripe_card_id
                : null,
              user_wallet_auto_charge_id:
                user_wallet_auto_charge_id == "" || !user_wallet_auto_charge_id
                  ? null
                  : user_wallet_auto_charge_id,
              net_balance: __USER_BALANCE + event.data.object.amount / 100,
              status: "active",
            }
          );

          await User.update(
            { user_balance: __USER_BALANCE + event.data.object.amount / 100 },
            { where: { id: user_id } }
          );
        }

        break;
      }
      case "payment_intent.payment_failed": {
        const {
          transaction_id,
          user_id,
          user_stripe_card_id,
          NODE_ENV,
          user_wallet_auto_charge_id,
          store_id,
        } = event.data.object.metadata;

        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_payment_intent_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );
        const __FAILED_TRANSACTION_HISTORY = await TransactionHistory.create({
          transaction_id,
          transaction_status: "failed",
          status: "active",
        });
        break;
      }
      case "payment_intent.canceled": {
        const {
          transaction_id,
          user_id,
          user_stripe_card_id,
          NODE_ENV,
          user_wallet_auto_charge_id,
          store_id,
        } = event.data.object.metadata;

        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_payment_intent_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );
        const __FAILED_TRANSACTION_HISTORY = await TransactionHistory.create({
          transaction_id,
          transaction_status: "failed",
          status: "active",
        });
        break;
      }
      case "payout.paid": {
        const {
          NODE_ENV,
          user_id,
          store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id,
          transaction_id,
        } = event.data.object.metadata;

        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_payout_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );
        const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
          transaction_id,
          transaction_status: "success",
          status: "active",
        });
        break;
      }
      case "payout.canceled": {
        const {
          NODE_ENV,
          user_id,
          store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id,
          transaction_id,
        } = event.data.object.metadata;
        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_payout_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );
        const __FAILED_TRANSACTION_HISTORY = await TransactionHistory.create({
          transaction_id,
          transaction_status: "failed",
          status: "active",
        });

        await returnStripePayout({
          user_id,
          store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id,
          transaction_id,
        });

        break;
      }
      case "payout.failed": {
        const {
          NODE_ENV,
          user_id,
          store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id,
          transaction_id,
        } = event.data.object.metadata;
        if (NODE_ENV != process.env.NODE_ENV) {
          return;
        }

        const __UPDATE_TRANSACTION = await Transaction.update(
          { stripe_payout_transaction_id: event.data.id },
          { where: { id: transaction_id } }
        );
        const __FAILED_TRANSACTION_HISTORY = await TransactionHistory.create({
          transaction_id,
          transaction_status: "failed",
          status: "active",
        });

        await returnStripePayout({
          user_id,
          store_id,
          store_wallet_transaction_id,
          user_stripe_bank_id,
          transaction_id,
        });

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    throw `Webhook Error: endpioint: ${err.message}`;
  }
};

module.exports = {
  createStripeUser,
  createUserStripeCard,
  userWalletRechargeWithCard,
  stripeWebHook,
  listUserCards,
  deleteUserStripeCard,
  createStoreStripeAccount,
  createStoreStripeBankAccount,
  createStripePayout,
  getStoreConnectedAccount,
  createUserStripeBankAccount,
  listUserBankAccounts,
  deleteUserBankAccount,
  storeWalletRechargeWithCard,

  getUserStripeConnectedAccount,
  returnStripePayout,
  stripeDocumentUpload,
  createUserWalletRechargeWithApplePayOrGooglePay,
};
