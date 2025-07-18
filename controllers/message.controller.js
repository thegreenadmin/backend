const sequelize = global["sequelize"];

const { Op } = require("sequelize");
const logger = require("../logger/logger");
const Message = require("../models/message/message.model");
const MessageHead = require("../models/message/message_head.model");
const Offer = require("../models/offer/offer.model");
const Order = require("../models/order/order.model");
const FavouriteStore = require("../models/store/favourite_stores.model");
const Store = require("../models/store/store.model");
const StoreUser = require("../models/store/store_users.model");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");
const SnsController = require("./sns.controller");
const Notification = require("../models/notification/notification.model");
const Role = require("../models/store/role.model");
const Permission = require("../models/store/permission.model");
const Controller = require("../models/module/controller.model");
const User = require("../models/user/user.model");

const createOfferMessageHeadsAndNotification = async function (
  store_id,
  offer_id,
  message,
  image_url,
  __SQL_TRANSACTION
) {
  try {
    const __STORE = await Store.findOne({ where: { id: store_id } });
    const title = `You have received a new offer from ${__STORE.store_name}`;

    const __FAVOURITE_USERS = await FavouriteStore.findAll({
      where: { store_id, status: "active" },
    });

    if (__FAVOURITE_USERS.length) {
      const __NOTIFICATIONS = await Notification.bulkCreate(
        __FAVOURITE_USERS.map((favUser) => {
          return {
            user_id: favUser.user_id,
            offer_id,
            store_id,
            is_notification_for_store: false,
            is_sent: true,
            is_read: false,
            title,
            message,
            status: "active",
          };
        }),
        {
          transaction: __SQL_TRANSACTION,
        }
      );

      const __MESSAGE_HEADS = await MessageHead.bulkCreate(
        __FAVOURITE_USERS.map((favUser) => {
          return {
            user_id: favUser.user_id,
            offer_id,
            store_id,
            is_available_for_store: false,
            is_available_for_user: true,
            is_store_completed: false,
            is_user_completed: false,
            status: "active",
          };
        }),
        {
          transaction: __SQL_TRANSACTION,
          returning: true,
        }
      );

      const __MESSAGES = await Message.bulkCreate(
        __MESSAGE_HEADS.map((mh) => {
          return {
            message_head_id: mh.id,
            sender_type: "store",
            message,
            image_url,
            is_user_read: false,
            is_store_read: false,
            is_current_message: true,
            status: "active",
          };
        }),
        {
          transaction: __SQL_TRANSACTION,
        }
      );

      let userTokens = [];
      for (let i = 0; i < __FAVOURITE_USERS.length; i++) {
        const __IS_PUSH_NOTIFICATION_AVAILABLE =
          await CommonController.isOpenForNotification(
            __FAVOURITE_USERS[i].user_id,
            false,
            "offer"
          );
        if (__IS_PUSH_NOTIFICATION_AVAILABLE) {
          const favUserTokens = await CommonController.getUserTokens(
            __FAVOURITE_USERS[i].user_id
          );
          userTokens = [...userTokens, ...favUserTokens];
        }
      }

      const notificationData = { type: "offer", offer_id, store_id };
      await SnsController.sendMutliPushNotifications(
        userTokens,
        title,
        message,
        notificationData
      );
    }
  } catch (err) {
    throw err;
  }
};

const createOrderMessageHead = async function (order, __SQL_TRANSACTION) {
  try {
    const __ORDER = order;

    const __ORDER_MESSAGE_HEAD = await MessageHead.create(
      {
        store_id: __ORDER.store_id,
        order_id: __ORDER.id,
        user_id: __ORDER.user_id,
        is_available_for_store: false,
        is_available_for_user: true,
        is_user_completed: false,
        is_store_completed: false,
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );

    const __ORDER_MESSAGE = await Message.create(
      {
        message_head_id: __ORDER_MESSAGE_HEAD.id,
        sender_type: "store",
        message: `Order successfully placed with OrderId: ${__ORDER.id}`,
        is_user_read: false,
        is_store_read: false,
        is_current_message: true,
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );

    return { message_head_id: __ORDER_MESSAGE_HEAD.id };
  } catch (err) {
    throw err;
  }
};

const fetchUserMessageHeads = async function (data, user_id) {
  // data = {page, page_size, show_previous_messages}
  try {
    const { page, page_size, show_previous_messages } = data;
    const order = [["updatedAt", "DESC"]];

    const msgReadFilter = show_previous_messages
      ? { is_user_completed: false }
      : { is_user_completed: false };

    const deletedOfferMessageHeads = await MessageHead.findAll({
      where: { offer_id: { [Op.ne]: null }, user_id, status: "active" },
      include: [
        {
          model: Offer,
          where: { status: "deleted" },
        },
      ],
    });
    const query = {
      where: {
        user_id,
        is_available_for_user: true,
        status: "active",
        id: { [Op.notIn]: deletedOfferMessageHeads.map((dMh) => dMh.id) },
        ...msgReadFilter,
      },
      attributes: {
        include: [["id", "message_head_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Message,
          required: false,
          where: { is_current_message: true, status: "active" },
          attributes: [],
        },
        {
          model: Store,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id", "image_url"],
          },
        },
        {
          model: Offer,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "offer_id"]],
            exclude: ["id"],
          },
        },
        {
          model: Order,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "order_id"]],
            exclude: ["id"],
          },
        },
        {
          model: User,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "user_id"]],
            exclude: ["id"],
          },
        },
      ],
    };

    const __MESSAGE_HEADS = await CommonController.getPaginationResult({
      Model: MessageHead,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const message_heads = __MESSAGE_HEADS.data.map((mh) => {
      const msgHead = mh.toJSON();

      const storeLogo = S3Controller.getAwsS3SignedFileUrl(
        msgHead.store.logo_url
      );
      delete msgHead.store.logo_url;
      msgHead.store.logo = storeLogo;

      if (msgHead.user) {
        msgHead.user.image = S3Controller.getAwsS3SignedFileUrl(
          msgHead.user.image_url
        );
        delete msgHead.user.image_url;
      }

      return msgHead;
    });

    return { total_count: __MESSAGE_HEADS.total_count, message_heads };
  } catch (err) {
    throw err;
  }
};

const fetchStoreMessageHeads = async function (data, user_id) {
  // data = {page, page_size, show_previous_messages}
  try {
    const { page, page_size, show_previous_messages } = data;
    const order = [["updatedAt", "DESC"]];

    const msgReadFilter = show_previous_messages
      ? { is_store_completed: true }
      : { is_store_completed: false };

    const __STORES = await Store.findAll({
      where: { status: "active" },
      include: [
        {
          model: StoreUser,
          where: { user_id, is_store_owner: true, status: "active" },
        },
      ],
    });

    const __EMPLOYEE_STORES = await Store.findAll({
      where: { status: "active" },
      include: [
        {
          model: StoreUser,
          where: { user_id, is_verified: true, status: "active" },
          include: [
            {
              model: Role,
              where: { status: "active" },
              include: [
                {
                  model: Permission,
                  where: { status: "active" },
                  include: [
                    {
                      model: Controller,
                      where: {
                        status: "active",
                        controller_key: "MANAGE_MESSAGE",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const stores = [];
    __STORES.map((s) => stores.push(s.id));
    __EMPLOYEE_STORES.map((s) => stores.push(s.id));

    const deletedOfferMessageHeads = await MessageHead.findAll({
      where: {
        offer_id: { [Op.ne]: null },
        store_id: { [Op.in]: stores },
        status: "active",
      },
      include: [
        {
          model: Offer,
          where: { status: "deleted" },
        },
      ],
    });

    // return __STORES;

    const query = {
      where: {
        is_available_for_store: true,
        status: "active",
        id: { [Op.notIn]: deletedOfferMessageHeads.map((dMh) => dMh.id) },
        store_id: { [Op.in]: stores },
        ...msgReadFilter,
      },
      attributes: {
        include: [["id", "message_head_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Message,
          required: false,
          where: { is_current_message: true, status: "active" },
          attributes: [],
        },
        {
          model: Store,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id", "image_url"],
          },
        },
        {
          model: Offer,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "offer_id"]],
            exclude: ["id"],
          },
        },
        {
          model: Order,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "order_id"]],
            exclude: ["id"],
          },
        },
        {
          model: User,
          required: false,
          where: { status: "active" },
          attributes: {
            include: [["id", "user_id"]],
            exclude: ["id"],
          },
        },
      ],
    };

    const __MESSAGE_HEADS = await CommonController.getPaginationResult({
      Model: MessageHead,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const message_heads = __MESSAGE_HEADS.data.map((mh) => {
      const msgHead = mh.toJSON();

      const storeLogo = S3Controller.getAwsS3SignedFileUrl(
        msgHead.store.logo_url
      );
      delete msgHead.store.logo_url;
      msgHead.store.logo = storeLogo;

      if (msgHead.user) {
        msgHead.user.image = S3Controller.getAwsS3SignedFileUrl(
          msgHead.user.image_url
        );
        delete msgHead.user.image_url;
      }

      return msgHead;
    });

    return { total_count: __MESSAGE_HEADS.total_count, message_heads };
  } catch (err) {
    throw err;
  }
};

const fetchMessages = async function (data) {
  // data = {page, page_size, message_head_id}
  try {
    const { page, page_size, message_head_id } = data;
    const order = [["id", "DESC"]];

    const __MESSAGES = await CommonController.getPaginationResult({
      Model: Message,
      page,
      page_size,
      order,
      as: "data",
      query: {
        where: { message_head_id, status: "active" },
        attributes: {
          include: [["id", "message_id"]],
          exclude: ["id"],
        },
      },
    });

    const __MESSAGE_HEAD = await MessageHead.findOne({
      where: { id: message_head_id },
      include: [
        {
          model: Store,
        },
        {
          model: User,
        },
      ],
    });

    const messages = __MESSAGES.data.map((msg) => {
      const message = msg.toJSON();
      if (msg.sender_type == "store") {
        message.icon = S3Controller.getAwsS3SignedFileUrl(
          __MESSAGE_HEAD?.store?.logo_url
        );
      } else {
        message.icon = S3Controller.getAwsS3SignedFileUrl(
          __MESSAGE_HEAD?.user?.image_url
        );
      }
      message.image = S3Controller.getAwsS3SignedFileUrl(msg?.image_url);
      message.user_name =
        __MESSAGE_HEAD?.user?.first_name +
        " " +
        __MESSAGE_HEAD?.user?.last_name;
      message.store_name = __MESSAGE_HEAD?.store?.store_name;
      return message;
    });

    return { total_count: __MESSAGES.total_count, messages };
  } catch (err) {
    throw err;
  }
};

const deleteStoreMessageHead = async function (data) {
  // data = {store_id, message_head_id}
  try {
    const { store_id, message_head_id } = data;
    const __DELETE_STORE_HEAD = await MessageHead.update(
      {
        is_store_completed: true,
      },
      {
        where: { id: message_head_id, store_id },
      }
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const deleteUserMessageHead = async function (data, user_id) {
  // data = {message_head_id}
  try {
    const { message_head_id } = data;
    const __DELETE_STORE_HEAD = await MessageHead.update(
      {
        is_user_completed: true,
      },
      {
        where: { id: message_head_id, user_id },
      }
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const fetchStoreMessages = async function (data) {
  // data = {store_id, page, page_size, message_head_id}
  try {
    const { store_id, page, page_size, message_head_id } = data;
    const __MESSAGE_HEAD = await MessageHead.findOne({
      where: { id: message_head_id, store_id, status: "active" },
    });

    const __MESSAGES = fetchMessages({
      page,
      page_size,
      message_head_id: __MESSAGE_HEAD.id,
    });
    // update all messages to read;
    const __MESSAGE_READ = await Message.update(
      { is_store_read: true },
      { where: { message_head_id, status: "active" } }
    );
    return __MESSAGES;
  } catch (err) {
    throw err;
  }
};

const fetchUserMessages = async function (data) {
  //data = {page, page_size, message_head_id}
  try {
    const { page, page_size, message_head_id } = data;
    const __MESSAGES = await fetchMessages(data);
    // update all messages to read;
    const __MESSAGE_READ = await Message.update(
      { is_user_read: true },
      { where: { message_head_id, status: "active" } }
    );
    return __MESSAGES;
  } catch (err) {
    throw err;
  }
};

const sendMessageAndCreateNotification = async function (
  data,
  isSendNotification = false
) {
  // data = {message_head_id, sender_type, message, image_url, is_user_read, is_store_read}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const {
      message_head_id,
      sender_type,
      message,
      image_url,
      is_user_read,
      is_store_read,
    } = data;

    const __MESSAGE = await Message.create(
      {
        message_head_id,
        sender_type,
        message,
        image_url,
        is_user_read,
        is_store_read,
        is_current_message: true,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    // remove current message status from all messages
    const __REMOVE_CURRENT_STATUS = await Message.update(
      { is_current_message: false },
      {
        where: { message_head_id, id: { [Op.notIn]: [__MESSAGE.id] } },
        transaction: __SQL_TRANSACTION,
      }
    );

    // update the message head
    const __MESSAGE_HEAD = await MessageHead.update(
      {
        is_available_for_store: true,
        is_available_for_user: true,
        status: "active",
      },
      {
        where: { id: message_head_id },
        returning: true,
        transaction: __SQL_TRANSACTION,
      }
    );

    if (!__MESSAGE_HEAD[1]) {
      throw "Something went wrong";
    }

    if (isSendNotification) {
      const title = "You have received a new message";
      const msgHead = __MESSAGE_HEAD[1][0];

      const storeOwner = await CommonController.getStoreOwnerUser(
        msgHead.store_id
      );

      let tokens = [];
      if (sender_type == "user") {
        const __IS_PUSH_NOTIFICATION_AVAILABLE =
          await CommonController.isOpenForNotification(
            storeOwner.id,
            true,
            "message"
          );

        if (__IS_PUSH_NOTIFICATION_AVAILABLE) {
          const storeOwnerTokens = await CommonController.getUserTokens(
            storeOwner.id
          );
          tokens = [...storeOwnerTokens];
        }
      } else {
        const __IS_PUSH_NOTIFICATION_AVAILABLE =
          await CommonController.isOpenForNotification(
            msgHead.user_id,
            false,
            "message"
          );
        if (__IS_PUSH_NOTIFICATION_AVAILABLE) {
          const userTokens = await CommonController.getUserTokens(
            msgHead.user_id
          );
          tokens = [...userTokens];
        }
      }

      const __NOTIFICATION = await Notification.create(
        {
          // user_id: sender_type == "user" ? msgHead.user_id : storeOwner.id,
          user_id: sender_type !== "user" ? msgHead.user_id : storeOwner.id,
          store_id: msgHead.store_id,
          message_head_id,
          is_notification_for_store: sender_type === "user",
          is_sent: true,
          is_read: false,
          title,
          message,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );

      const notificationData = {
        type: "message",
        sender_type,
        message_head_id,
        store_id: msgHead.store_id,
      };
      await SnsController.sendMutliPushNotifications(
        tokens,
        title,
        message,
        notificationData
      );
    }

    await __SQL_TRANSACTION.commit();
    return { is_send: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const userSendMessage = async function (data, user_id) {
  // data = {message_head_id, message, image_url}
  try {
    const { message_head_id, message, image_url } = data;

    const __MESSAGE_HEAD = await MessageHead.findOne({
      where: { id: message_head_id },
    });

    if (!__MESSAGE_HEAD) {
      throw "Invalid conversation";
    }

    return await sendMessageAndCreateNotification(
      {
        message_head_id,
        message,
        image_url,
        sender_type: "user",
        is_user_read: true,
        is_store_read: false,
      },
      true
    );
  } catch (err) {
    throw err;
  }
};

const storeSendMessage = async function (data) {
  // data = {message_head_id, store_id, message, image_url}
  try {
    const { message_head_id, store_id, message, image_url } = data;

    const __MESSAGE_HEAD = await MessageHead.findOne({
      where: { id: message_head_id, store_id },
    });

    if (!__MESSAGE_HEAD) {
      throw "Invalid conversation";
    }

    return await sendMessageAndCreateNotification(
      {
        message_head_id,
        message,
        image_url,
        sender_type: "store",
        is_user_read: false,
        is_store_read: true,
      },
      true
    );
  } catch (err) {
    throw err;
  }
};

const contactStoreMessages = async function (data, user_id) {
  // data = {store_id}
  try {
    const { store_id } = data;
    let __MESSAGE_HEAD = await MessageHead.findOne({
      where: {
        user_id,
        store_id,
        offer_id: null,
        order_id: null,
        status: "active",
      },
    });

    if (!__MESSAGE_HEAD) {
      __MESSAGE_HEAD = await MessageHead.create({
        user_id,
        store_id,
        is_available_for_store: false,
        is_available_for_user: true,
        is_store_completed: false,
        is_user_completed: false,
        status: "active",
      });
    }

    const __STORE = await Store.findOne({ where: { id: store_id } });
    const messages = await fetchMessages({
      page: 1,
      page_size: 10,
      message_head_id: __MESSAGE_HEAD.id,
    });

    messages.store_id = store_id;
    messages.store_name = __STORE.store_name;
    messages.message_head_id = __MESSAGE_HEAD.id;

    return messages;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createOfferMessageHeadsAndNotification,
  fetchUserMessageHeads,
  fetchUserMessages,
  createOrderMessageHead,
  userSendMessage,
  storeSendMessage,
  fetchStoreMessageHeads,
  fetchStoreMessages,
  deleteStoreMessageHead,
  deleteUserMessageHead,
  contactStoreMessages,
};
