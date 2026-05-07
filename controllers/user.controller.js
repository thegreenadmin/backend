require("custom-env").env(true);
const moment = require("moment");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const User = require("../models/user/user.model");
const UserOTP = require("../models/user/user_otp.model");
const HELPERS = require("../utils/helper.utils");
const MESSAGES = require("../utils/messages.util");
const SnsController = require("./sns.controller");

const UserSession = require("../models/user/user_sessions.model");
const ProofType = require("../models/proof/proof_type.model");
const UserProof = require("../models/user/user_proof.model");
const Store = require("../models/store/store.model");
const FavouriteStore = require("../models/store/favourite_stores.model");
const UserAddress = require("../models/user/user_address.model");
const State = require("../models/state/state.model");
const Country = require("../models/state/country.model");
const FavouriteProduct = require("../models/catalogue/favourite_product.model");
const Order = require("../models/order/order.model");
const S3Controller = require("./s3.controller");
const CommonController = require("./common.controller");
const BlockUser = require("../models/user/block_user.model");
const { verifyAddress, getCityFromPostalCode } = require("./usps.controller");
const logger = require("../logger/logger");
const StoreUser = require("../models/store/store_users.model");
const { createUser_Template } = require("../config/email_templates.config");
const { saveNotificationSetting } = require("./notification.controller");
const Role = require("../models/store/role.model");

/**
 * @implements {user}
 * @description create user
 *  */
const createUser = async function (data) {
  // data = {first_name, last_name, email, phone, phone_code, dob, has_store_access}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      phone_code,
      dob,
      has_store_access,
      is_store_owner,
    } = data;
    const status = "active";
    let user = null;

    const __USER = await User.findOne({
      where: { phone, phone_code, status, is_account_deleted: false },
    });

    if (has_store_access) {
      if (!__USER) {
        user = await User.create(
          {
            first_name,
            last_name,
            email,
            phone,
            phone_code,
            dob,
            status,
            has_store_access,
            is_account_deleted: false,
            user_balance: 0,
            is_store_owner,
          },
          { transaction: __SQL_TRANSACTION }
        );
      } else {
        if (__USER.has_store_access || __USER.is_store_owner) {
          throw "Store owner already exists, please login to continue";
        }

        const store_access_registeration_detail = JSON.stringify({
          first_name,
          last_name,
          email,
          createdAt: moment().utc().toDate(),
        });

        user = __USER;
        await User.update(
          { store_access_registeration_detail },
          { where: { id: user.id }, transaction: __SQL_TRANSACTION }
        );
      }
    } else {
      if (__USER) {
        throw "User already exists, please login to continue";
      }

      user = await User.create(
        {
          first_name,
          last_name,
          email,
          phone,
          phone_code,
          dob,
          status,
          has_store_access,
          is_account_deleted: false,
          user_balance: 0,
          is_store_owner: false,
        },
        { transaction: __SQL_TRANSACTION }
      );
    }

    if (!has_store_access) {
      await SnsController.sendEmail(
        email,
        "Welcome",
        createUser_Template(
          user.first_name + " " + user.last_name,
          has_store_access
        ),
        process.env.ADMIN_EMAIL
      );
    }

    __SQL_TRANSACTION.afterCommit(() => {
      if (!__USER) {
        ["order", "offer", "message"].forEach(async (notification_type) => {
          try {
            await saveNotificationSetting(
              { notification_type, is_for_store: false, is_enabled: true },
              user.id
            );
            has_store_access
              ? await saveNotificationSetting(
                  { notification_type, is_for_store: true, is_enabled: true },
                  user.id
                )
              : "";
          } catch (err) {
            console.log(err);
          }
        });
      }
    });

    await __SQL_TRANSACTION.commit();
    return { user_id: user.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

/**
 * @implements {otp}
 * @description create otp for the user
 *  */
const generateOTP = async function (data) {
  // data = { phone, phone_code }
  const { phone, phone_code } = data;
  try {
    const user = await User.findOne({
      where: { phone, phone_code, is_account_deleted: false, status: "active" },
    });
    if (!user) {
      throw MESSAGES.USER_NOT_FOUND;
    }
    let otp = HELPERS.generateRandomNumber();
    if (otp.length <= 4) {
      if (otp.length == 1) {
        otp += "000";
      }
      if (otp.length == 2) {
        otp += "00";
      }
      if (otp.length == 3) {
        otp += "0";
      }
    }

    console.log({ otp });
    const afterFiveMinutes = moment().utc().add(5, "minutes");

    const __OTP__AVAILABLE = await UserOTP.findOne({
      where: { user_id: user.id },
    });
    if (!__OTP__AVAILABLE) {
      const userOtp = await UserOTP.create({
        user_id: user.id,
        otp: otp,
        is_used: false,
        expiredAt: afterFiveMinutes,
        status: "active",
      });
    } else {
      await UserOTP.update(
        {
          user_id: user.id,
          otp: otp,
          is_used: false,
          expiredAt: afterFiveMinutes,
          status: "active",
        },
        {
          where: { id: __OTP__AVAILABLE.id },
        }
      );
    }
    const _sendOtp = await SnsController.sendOtp(
      user.phone,
      user.phone_code,
      otp
    );
    return otp;
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {otp}
 * @description verify user otp
 *  */
// verify otp return token when otp successfully verified
const verifyOTP = async function (data) {
  // data = {phone, phone_code, otp, device_id, device_type, device_token}
  const __SQL_TRANSACTION = await sequelize.transaction();
  const { phone, phone_code, otp, device_id, device_type, device_token } = data;
  try {
    const user = await User.findOne({
      where: { phone, phone_code, is_account_deleted: false, status: "active" },
    });

    if (!user) {
      throw MESSAGES.USER_NOT_FOUND;
    }
    let has_store_access = user.has_store_access;
    let is_store_owner = user.is_store_owner;
    const __OTP__ = await UserOTP.findOne({
      where: {
        user_id: user.id,
        is_used: false,
        expiredAt: {
          [Op.gte]: moment().utc().add(-5, "minutes").toDate(),
        },
      },
    });

    if (!__OTP__) {
      throw MESSAGES.OTP_NOT_GENERATED;
    }

    const currentEnv = process.env.NODE_ENV || "local";
    const allowedEnvironments = ["staging", "local", "prod", "live"];

    if (
      (allowedEnvironments.includes(currentEnv) &&
        __OTP__["otp"] != otp &&
        otp != "0000") ||
      (!allowedEnvironments.includes(currentEnv) && __OTP__["otp"] != otp)
    ) {
      throw MESSAGES.OTP_NOT_MATCHED;
    }

    // update the OTP is_used flag
    await UserOTP.update(
      {
        is_used: true,
      },
      {
        where: { id: __OTP__.id },
        transaction: __SQL_TRANSACTION,
      }
    );

    // delete old user device sessions
    const deletedOldDeviceSessions = await UserSession.update(
      { status: "deleted" },
      {
        where: { device_token },
        transaction: __SQL_TRANSACTION,
      }
    );

    // create user session
    const userSession = await UserSession.create(
      {
        user_id: user.id,
        device_id,
        device_token,
        device_type: device_type ? device_type : "GSM",
        expiredAt: moment()
          .utc()
          .add(parseInt(process.env.JWT_TOKEN_EXPIARATION), "days")
          .toDate(),
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );

    // create JWT token for the user
    const token = jwt.sign(
      {
        data: {
          id: user.id,
          session_id: userSession.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
        },
        exp: HELPERS.getSecondsFromDaysCount(process.env.JWT_TOKEN_EXPIARATION),
      },
      process.env.JWT_ENCRYPTION_KEY
    );

    if (!user.has_store_access && user.store_access_registeration_detail) {
      const store_access_registeration_detail = JSON.parse(
        user.store_access_registeration_detail
      );
      const createdAt = moment(
        store_access_registeration_detail.createdAt
      ).utc();
      const currentDate = moment().utc().add(-5, "minutes");

      if (currentDate.isBefore(createdAt)) {
        await User.update(
          {
            ...store_access_registeration_detail,
            has_store_access: true,
            is_store_owner: true,
            store_access_registeration_detail: null,
          },
          {
            where: { id: user.id },
            transaction: __SQL_TRANSACTION,
          }
        );

        await SnsController.sendEmail(
          store_access_registeration_detail.email,
          "Welcome",
          createUser_Template(
            store_access_registeration_detail.first_name +
              " " +
              store_access_registeration_detail.last_name,
            true
          ),
          process.env.ADMIN_EMAIL
        );

        has_store_access = true;
        is_store_owner = true;
      } else {
        // logger.log("kuch toh gadbad hai")
      }
    }

    const $user = await StoreUser.findOne(
      {
        where: {
          user_id: user.id,
        },
      },
      { transaction: __SQL_TRANSACTION }
    );

    const isUserStoreOwner = () => {
      if ($user?.is_store_owner) return $user.is_store_owner;
      else if (has_store_access && is_store_owner === true)
        return is_store_owner;
      else return false;
    };

    // let isUserStoreOwner =
    //   $user && $user.is_store_owner ? $user.is_store_owner : false;

    // commit the changes
    await __SQL_TRANSACTION.commit();
    return { token, has_store_access, is_store_owner: isUserStoreOwner() };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

/**
 * @implements {user_details}
 * @description get user and address details
 *  */
const getUserDetials = async function (user_id, showUrserImage = false) {
  try {
    const __USER = await User.findOne({
      where: { id: user_id, is_account_deleted: false, status: "active" },
      attributes: [
        ["id", "user_id"],
        "uuid",
        "first_name",
        "last_name",
        "nick_name",
        "email",
        "phone",
        "phone_code",
        "image_url",
        "has_store_access",
      ],
      include: [
        {
          model: UserAddress,
          where: { user_id, status: "active" },
          required: false,
          attributes: [
            ["id", "user_address_id"],
            "address_name",
            "address_line_1",
            "address_line_2",
            "city",
            "postal_code",
          ],
          include: [
            {
              model: State,
              required: true,
              where: { status: "active" },
              attributes: [["id", "state_id"], "state_name"],
              include: [
                {
                  model: Country,
                  required: true,
                  attributes: [["id", "country_id"], "country_name"],
                  where: { status: "active" },
                },
              ],
            },
          ],
        },
        {
          model: BlockUser,
          required: false,
          where: { status: "active" },
        },
      ],
    });

    if (!__USER) {
      throw "User not found";
    }

    const user = __USER.toJSON();

    if (showUrserImage) {
      user.image = S3Controller.getAwsS3SignedFileUrl(user.image_url);
    }
    user.is_blocked = user?.block_users.length ? true : false;

    delete user.image_url;
    delete user.block_users;

    const __USER_PROOF = await UserProof.findOne({
      where: { user_id, status: "active" },
      attributes: {
        include: [["id", "user_proof_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: ProofType,
          where: { status: "active" },
        },
      ],
    });

    if (__USER_PROOF) {
      const userProof = __USER_PROOF.toJSON();
      const image = S3Controller.getAwsS3SignedFileUrl(userProof.image_url);
      delete userProof.image_url;

      return { user, user_proof: Object.assign({ image }, userProof) };
    }

    return { user, user_proof: null };
  } catch (err) {
    throw err;
  }
};

const logoutUser = async function (user_id) {
  try {
    await UserSession.update(
      { status: "deleted", expiredAt: moment().utc().toDate() },
      { where: { user_id } }
    );
    return { is_updated: true };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {user_details}
 * @description update user and address details
 *  */
const updateUserDetails = async function (data, user_id) {
  // data = {
  //user: {first_name, last_name, nick_name},
  //address: {user_address_id, state_id, address_name, address_line_1, address_line_2, city, postal_code}
  //}

  try {
    const { user, address } = data;
    // update the user
    const ___UPDATED_USER = await User.update(
      {
        first_name: user.first_name,
        last_name: user.last_name,
        nick_name: user.nick_name,
      },
      { where: { id: user_id, status: "active" } }
    );

    if (address) {
      const __ADDRESS = address.user_address_id
        ? await UserAddress.findOne({
            where: { id: address.user_address_id, user_id, status: "active" },
          })
        : null;

      const state_id = await CommonController.getStateId(
        address.country,
        address.state
      );

      if (!__ADDRESS) {
        var __USER_ADDRESS = await UserAddress.create({
          user_id: user_id,
          address_name: address.address_name,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2,
          city: address.city,
          postal_code: address.postal_code,
          state_id: state_id,
          status: "active",
        });

        if (!__USER_ADDRESS) {
          throw "Address not validated";
        }
      } else {
        var __USER_ADDRESS = await UserAddress.update(
          {
            address_name: address.address_name,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            city: address.city,
            postal_code: address.postal_code,
            state_id: state_id,
          },
          {
            where: { id: __ADDRESS.id, user_id: user_id, status: "active" },
          }
        );
      }
    }

    return true;
  } catch (err) {
    throw err;
  }
};

const allowUserStoreAccess = async function (data, user_id) {
  // data = {has_store_access}
  try {
    const { has_store_access } = data;
    await User.update({ has_store_access }, { where: { id: user_id } });
    return { is_store_accessible: has_store_access };
  } catch (err) {
    throw err;
  }
};

const deleteUser = async function (user_id) {
  try {
    const OrderController = require("./order.controller"); // to prevent this from recursion

    const userActiveOrders = await OrderController.listUserOrders(
      {
        only_active_orders: true,
        order_statuses: [],
      },
      user_id
    );

    if (userActiveOrders.orders.length) {
      throw "You have active orders";
    }

    const storeActiveOrders = await OrderController.listStoreOrders(
      {
        page: 1,
        page_size: 10,
        order_by: "order_id",
        order_type: "DESC",
        only_active_orders: true,
        from_date: null,
        to_date: null,
      },
      user_id
    );

    if (storeActiveOrders.orders.length) {
      throw "You have active orders in the store";
    }

    await User.update({ is_account_deleted: true }, { where: { id: user_id } });

    // now delete all stores of this user

    const __STORES = await Store.findAll({
      where: { status: "active" },
      include: [
        {
          model: StoreUser,
          where: { user_id, is_store_owner: true, status: "active" },
        },
      ],
    });

    if (__STORES.length) {
      await Store.update(
        { status: "deleted" },
        { where: { id: { [Op.in]: __STORES.map((s) => s.id) } } }
      );
    }

    return { is_account_deleted: true };
  } catch (err) {
    throw err;
  }
};

/**
 * @implements {user_proof}
 * @description create user identity details
 *  */
const saveUserIdentityDetails = async function (data, user_id, is_verified) {
  // data = {proof_type_id, proof_value, image_url, expiredAt}
  const { proof_type_id, proof_value, image_url, expiredAt } = data;
  try {
    const __PROOF_TYPE = await ProofType.findOne({
      where: { id: proof_type_id, is_enabled: true, status: "active" },
    });
    if (!__PROOF_TYPE) {
      throw MESSAGES.PROOF_TYPE_UNAVAILABLE;
    }

    const __USER_PROOF = await UserProof.findOne({
      where: { user_id },
    });

    if (__USER_PROOF) {
      await UserProof.update(
        {
          proof_value: proof_value,
          image_url: image_url,
          is_verified: is_verified ? true : false,
          expiredAt: __PROOF_TYPE.has_expiration ? expiredAt : null,
        },
        {
          where: { id: __USER_PROOF.id },
        }
      );
      return { user_proof_id: __USER_PROOF.id };
    }

    const userProof = await UserProof.create({
      user_id: user_id,
      proof_type_id: proof_type_id,
      proof_value: proof_value,
      image_url: image_url,
      is_verified: is_verified ? true : false,
      expiredAt: __PROOF_TYPE.has_expiration ? expiredAt : null,
      status: "active",
    });
    return { user_proof_id: userProof.id };
  } catch (err) {
    if (
      err.name == MESSAGES.EXCEPTION_NAME_SEQUALIZE_UNIQUE_CONSTRAINT &&
      err.message == MESSAGES.EXCEPTION_MESSAGE_VALIDATION_ERROR
    ) {
      throw MESSAGES.USER_PROOF_ALREADY_AVILABLE;
    }
    throw err;
  }
};

/**
 * @implements {favourite_store}
 * @description store favourite store for the user
 *  */
const saveFavouriteStore = async function (data, user_id) {
  // data = {store_id}
  try {
    const { store_id } = data;
    const __STORE = await Store.findOne({
      where: { id: store_id, status: "active" },
    });
    if (!__STORE) {
      throw MESSAGES.STORE_UNAVAILABLE;
    }

    const favouriteStore = await FavouriteStore.create({
      store_id,
      user_id,
      status: "active",
    });
    return { favourite_store_id: favouriteStore.id };
  } catch (err) {
    if (
      err.name == MESSAGES.EXCEPTION_NAME_SEQUALIZE_UNIQUE_CONSTRAINT &&
      err.message == MESSAGES.EXCEPTION_MESSAGE_VALIDATION_ERROR
    ) {
      throw MESSAGES.FAVOURITE_STORE_ALREADY_EXISTS;
    }
    throw err;
  }
};

/**
 * @implements {favourite_store}
 * @description store favourite store for the user
 *  */
const removeFavouriteStore = async function (data, user_id) {
  // datastore_id}
  try {
    const { store_id } = data;
    const removeFavStore = await FavouriteStore.update(
      { status: "deleted" },
      {
        where: { store_id, user_id: user_id, status: "active" },
      }
    );
    if (!removeFavStore || !removeFavStore[0]) {
      throw MESSAGES.FAVOURITE_STORE_NOT_EXISTS;
    }
    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const createFavouriteProduct = async function (product_id, user_id) {
  try {
    const __FAVOURITE_PRODUCT = await FavouriteProduct.create({
      product_id,
      user_id,
      status: "active",
    });
    return { favourite_product_id: __FAVOURITE_PRODUCT.id };
  } catch (err) {
    throw err;
  }
};

const removeFavouriteProduct = async function (product_id, user_id) {
  try {
    const __REMOVE_FAVOURITE_PRODUCT = await FavouriteProduct.update(
      { status: "deleted" },
      { where: { product_id, user_id } }
    );

    if (!__REMOVE_FAVOURITE_PRODUCT[0]) {
      throw "Favourite product not exists";
    }

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

//admin
//admin
//admin
//admin
//admin
//admin

const admin_listUsers = async function (data) {
  // data = { q, page, page_size, order_by, order_type}
  try {
    const { q, page, page_size, order_by, order_type } = data;

    const order =
      order_by && order_type ? [[order_by, order_type]] : [["id", "DESC"]];

    const query = {
      attributes: {
        include: [
          ["id", "user_id"],
          [
            sequelize.literal(`CONCAT(first_name, ' ', last_name)`),
            "full_name",
          ],
        ],
        exclude: ["id"],
      },
      where: {
        [Op.or]: [
          sequelize.literal(`
                        LOWER(CONCAT(first_name, ' ', last_name)) LIKE '%${q.toLowerCase()}%'
                    `),
          {
            email: { [Op.iLike]: `%${q}%` },
          },
        ],
        is_account_deleted: false,
        status: "active",
      },
    };

    const __USERS = await CommonController.getPaginationResult({
      Model: User,
      query,
      page,
      page_size,
      as: "users",
      order,
    });

    return __USERS;
  } catch (err) {
    throw err;
  }
};

const admin_userDetails = async function (data) {
  // data = {user_id}
  try {
    const { user_id } = data;
    return await getUserDetials(user_id, true);
  } catch (err) {
    throw err;
  }
};

const admin_blockUser = async function (data) {
  // data = {user_id}
  try {
    const { user_id } = data;
    const __IS_BLOCKED_USER = await BlockUser.findOne({
      where: { user_id, status: "active" },
    });

    if (__IS_BLOCKED_USER) {
      throw "User already blocked";
    }

    const __BLOCK_USER = await BlockUser.create({ user_id, status: "active" });
    return { block_user_id: __BLOCK_USER.id };
  } catch (err) {
    throw err;
  }
};

const admin_removeBlockUser = async function (data) {
  // data = {user_id}
  try {
    const { user_id } = data;
    await BlockUser.update({ status: "deleted" }, { where: { user_id } });

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createUser,
  generateOTP,
  verifyOTP,
  saveUserIdentityDetails,
  saveFavouriteStore,
  removeFavouriteStore,
  updateUserDetails,
  getUserDetials,
  createFavouriteProduct,
  removeFavouriteProduct,
  allowUserStoreAccess,
  deleteUser,
  logoutUser,

  admin_listUsers,
  admin_userDetails,
  admin_blockUser,
  admin_removeBlockUser,
};
