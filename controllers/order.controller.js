const { Op } = require("sequelize");
const moment = require("moment");
const sequelize = global["sequelize"];

const CartItem = require("../models/cart/cart_item.model");
const Product = require("../models/catalogue/product.model");
const DeliveryService = require("../models/delivery/delivery_service.model");
const StoreDeliveryService = require("../models/delivery/store_delivery_service.model");
const Order = require("../models/order/order.model");
const OrderStatus = require("../models/order/order_status.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const StoreAddress = require("../models/store/store_address.model");
const User = require("../models/user/user.model");
const UserAddress = require("../models/user/user_address.model");
const MESSAGES = require("../utils/messages.util");
const CommonController = require("./common.controller");
const OfferController = require("./offer.controller");
const OrderItem = require("../models/order/order_item.model");
const OrderDeliveryAddress = require("../models/order/order_delivery_address.model");
const Store = require("../models/store/store.model");
const logger = require("../logger/logger");
const TransactionController = require("./transaction.controller");
const OrderHistory = require("../models/order/order_history.model");
const S3Controller = require("./s3.controller");
const ProductImage = require("../models/catalogue/product_image.model");
const ProductReview = require("../models/catalogue/product_review.model");
const StoreController = require("./store.controller");
const ReturnOrderItemStatus = require("../models/order/return_order_item_status.model");
const ReturnOrderItem = require("../models/order/return_order_item.model");
const ReturnOrderItemHistory = require("../models/order/return_order_item_history.model");
const MessageController = require("./message.controller");
const OrderNotification = require("../models/notification/order_history_notification.model");
const UserProof = require("../models/user/user_proof.model");
const ProofType = require("../models/proof/proof_type.model");
const Notification = require("../models/notification/notification.model");
const SNSController = require("./sns.controller");
const OrderServiceCharge = require("../models/order/order_service_charge.model");
const { verifyAddress } = require("./usps.controller");
const AdminNotification = require("../models/notification/admin_notification.model");
const OrderTransaction = require("../models/transaction/order_transaction.model");

const iamhereNotification = async function (data) {
  try {
    const { store_id, order_id, user_id } = data;
    const __USER = await User.findOne({
      where: { id: user_id, status: "active" },
    });
    const __NEW_ORDER_USER_NOTIFICATION = await Notification.create({
      user_id: user_id,
      store_id,
      order_id,
      is_notification_for_store: true,
      is_sent: false,
      is_read: false,
      title: `${__USER.first_name} reached the store for pickup the Order for Order Id ${order_id}.`,
      message: `${__USER.first_name} reached the store for pickup the Order for Order Id '${order_id}'.`,
      status: "active",
    });

    const Pdata = {
      store_id,
      order_id,
      type: "order",
      sender_type: "user",
    };

    const userTokens = await CommonController.getUserTokens(user_id);
    await SNSController.sendMutliPushNotifications(
      userTokens,
      __NEW_ORDER_USER_NOTIFICATION.title,
      __NEW_ORDER_USER_NOTIFICATION.message,
      Pdata
    );
    await Notification.update(
      { is_sent: true },
      { where: { id: __NEW_ORDER_USER_NOTIFICATION.id } }
    );

    return __NEW_ORDER_USER_NOTIFICATION;
  } catch (err) {
    throw err;
  }
};

const listOrderStatuses = async function () {
  try {
    const __ORDER_STATUSES = await OrderStatus.findAll({
      attributes: {
        include: [["id", "order_status_id"]],
        exclude: ["id", "createdAt", "updatedAt"],
      },
      where: { status: "active" },
    });

    return __ORDER_STATUSES;
  } catch (err) {
    throw err;
  }
};

const createOrder = async function (data, user_id) {
  // data = {store_id, store_delivery_service_id, cart_items}
  // cart_items = [{cart_item_id, items_count}]

  const __SQL_TRANSACTION = await sequelize.transaction();

  try {
    const { store_id, store_delivery_service_id, user_address_id, cart_items } =
      data;
    const __USER = await User.findOne({
      where: { id: user_id, status: "active" },
    });
    const __ORDER_SERVICE_CHARGE =
      await CommonController.getOrderServiceCharge();

    if (!__ORDER_SERVICE_CHARGE) {
      throw "Order Service Charge is unavailable";
    }

    const __STORE = await Store.findOne({
      where: {
        id: store_id,
        is_verified: true,
        is_enabled: true,
        status: "active",
      },
    });

    if (!__STORE) {
      throw MESSAGES.STORE_UNAVAILABLE;
    }

    const __CART_ITEMS = await CartItem.findAll({
      where: {
        id: { [Op.in]: cart_items.map((ci) => ci.cart_item_id) },
        status: "active",
      },
      include: [
        {
          model: Product,
          where: { store_id, is_enabled: true, status: "active" },
        },
      ],
    });

    if (!__CART_ITEMS.length) {
      throw "Cart is empty";
    }

    const __OFFERS = await (
      await OfferController.shop_listStoreOffers(store_id, true)
    ).offers;
    let totalWeight = 0;
    let orderSubTotal = 0.0;
    const orderItems = __CART_ITEMS.map((item) => {
      const cartItem = item.toJSON();
      const product = cartItem.product;
      totalWeight += product.weight;
      const items_count = cartItem?.items_count;
      let offer = null;
      let offerPrice = product.selling_price;
      // find if any offer for store

      const offers = [];
      const __STORE_OFFER = __OFFERS.find((offer) => offer.is_offer_for_store);
      if (__STORE_OFFER) {
        offer = __STORE_OFFER;
        offers.push(__STORE_OFFER);
      } else {
        for (let i = 0; i < __OFFERS.length; i++) {
          const _offer = __OFFERS[i];
          const __IS_OFFER_PRODUCT = _offer?.offer_products?.find(
            (op) => op.product_id == product.id
          );
          if (__IS_OFFER_PRODUCT) {
            offer = __OFFERS[i];
            offers.push(__OFFERS[i]);
            delete offer.offer_products;
            break;
          }
        }
      }

      let maxDiscount = 0;

      for (let i = 0; i < offers.length; i++) {
        const discountOffset = CommonController.getCalculateOffset(
          product.selling_price,
          offers[i].offer_type,
          offers[i].offer_value
        );
        if (discountOffset > maxDiscount) {
          maxDiscount = discountOffset;
          offer = offers[i];
        }
      }

      console.log(product, "...........product");
      console.log(offer, "...........offer");

      if (offer) {
        offerPrice = CommonController.getCalculatedPrice(
          product.selling_price,
          offer.offer_type,
          offer.offer_value
        );
      } else {
        offerPrice = CommonController.getCalculatedPrice(
          product.selling_price,
          product.discount_type,
          product.discount_value
        );
      }

      const subTotal = product.selling_price * items_count;
      let totalDiscount = (product.selling_price - offerPrice) * items_count;
      totalDiscount = Math.round(totalDiscount * 10) / 10;
      const totalCharge = subTotal - totalDiscount;

      subTotal - totalDiscount, (orderSubTotal += totalCharge);

      return {
        product_id: product.id,
        order_item_count: cart_items.find(
          (ci) => ci.cart_item_id == cartItem.id
        ).items_count,
        order_item_price: product.selling_price,

        discount_name: offer ? offer.offer_name : "",
        discount_type: offer ? offer.offer_type : product.discount_type,
        discount_value: offer ? offer.offer_value : product.discount_value,
        total_discount: totalDiscount,

        order_item_status: "received",
        status: "active",
      };
    });

    const __STORE_DELIVERY_SERVICE = await StoreDeliveryService.findOne({
      where: {
        id: store_delivery_service_id,
        store_id,
        is_enabled: true,
        status: "active",
      },
      include: [
        {
          model: DeliveryService,
          is_enabled: true,
          status: "active",
        },
      ],
    });

    if (!__STORE_DELIVERY_SERVICE) {
      throw "You have not selected any delivery service";
    }
    const __STORE_ADDRESS = await StoreAddress.findOne({
      where: { store_id, status: "active" },
      include: [{ model: State, include: [{ model: Country }] }],
    });

    if (!__STORE_ADDRESS) {
      throw "Store address is unavailable";
    }

    const __USER_ADDRESS = user_address_id
      ? await UserAddress.findOne({
          where: { id: user_address_id, user_id, status: "active" },
          include: [{ model: State, include: [{ model: Country }] }],
        })
      : null;

    if (
      __USER_ADDRESS &&
      __STORE_DELIVERY_SERVICE.delivery_service.delivery_service_name ==
        "Delivery"
    ) {
      const userAddressVerification = await verifyAddress(
        __USER_ADDRESS.toJSON()
      );
      if (!userAddressVerification.result) {
        throw "Address is non deliverable, please change to continue";
      }
    }

    let __DELIVERY_CHARGE = 0;
    const __DELIVERY_CHARGE_RES =
      __STORE_DELIVERY_SERVICE && __STORE_ADDRESS
        ? await CommonController.getDeliveryServiceCharge(
            __STORE_DELIVERY_SERVICE.toJSON(),
            __STORE_ADDRESS.postal_code,
            __USER_ADDRESS
              ? __USER_ADDRESS.postal_code
              : __STORE_ADDRESS.postal_code,
            totalWeight
          )
        : { result: true, rate: 0 };

    if (__DELIVERY_CHARGE_RES.result == false) {
      throw "Order is not deliverable, please change delivery method";
    } else {
      __DELIVERY_CHARGE = parseFloat(__DELIVERY_CHARGE_RES.rate);
    }

    const __TAX = __STORE_ADDRESS
      ? await CommonController.getTaxRate(
          __STORE_ADDRESS.toJSON(),
          __USER_ADDRESS ? __USER_ADDRESS.toJSON() : __STORE_ADDRESS.toJSON(),
          store_id,
          orderSubTotal,
          __DELIVERY_CHARGE
        )
      : await CommonController.getTaxRate(
          null,
          null,
          store_id,
          orderSubTotal,
          __DELIVERY_CHARGE
        );

    let __TOTAL_TAX_CHARGED = CommonController.getCalculateOffset(
      orderSubTotal + __DELIVERY_CHARGE,
      __TAX.tax_type,
      __TAX.tax_value
    );
    const totalServiceCharge = CommonController.getCalculateOffset(
      orderSubTotal + __DELIVERY_CHARGE + __TOTAL_TAX_CHARGED,
      __ORDER_SERVICE_CHARGE.service_charge_type,
      __ORDER_SERVICE_CHARGE.service_charge_value
    );
    const __ORDER = await Order.create(
      {
        user_id,
        store_id,
        delivery_service_id: __STORE_DELIVERY_SERVICE.delivery_service_id,
        delivery_charge: __DELIVERY_CHARGE,
        service_charge_type: __ORDER_SERVICE_CHARGE.service_charge_type,
        service_charge_value: __ORDER_SERVICE_CHARGE.service_charge_value,
        total_service_charged: totalServiceCharge,

        tax_type: __TAX.tax_type,
        tax_value: __TAX.tax_value,
        total_tax_charged: __TOTAL_TAX_CHARGED,
        total_amount:
          orderSubTotal +
          totalServiceCharge +
          __DELIVERY_CHARGE +
          __TOTAL_TAX_CHARGED,
        customer_name: `${__USER.first_name} ${__USER.last_name}`,
        customer_email: __USER.email,
        customer_phone: __USER.phone,
        customer_phone_code: __USER.phone_code,
        estimate_delivery_date: moment().utc().add("15", "days").toDate(),
        order_date: moment().utc().toDate(),
        delivery_date: null,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __CREATED_ORDER_STATUS = await OrderStatus.findOne({
      where: { order_status_name: "received", status: "active" },
    });

    if (!__CREATED_ORDER_STATUS) {
      throw "Order status not found";
    }

    const __CREATED_ORDER_HISTORY = await OrderHistory.create(
      {
        order_id: __ORDER.id,
        order_status_id: __CREATED_ORDER_STATUS.id,
        is_current_status: true,
        is_created_by_store: false,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __ORDER_ITEMS = await OrderItem.bulkCreate(
      orderItems.map((item) => {
        return { ...item, order_id: __ORDER.id };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    const __IS_CURB_SIDE_OR_IN_STORE_DELIVERY_SERVICE =
      __STORE_DELIVERY_SERVICE.delivery_service.delivery_service_name.toLowerCase() ==
        "in store" ||
      __STORE_DELIVERY_SERVICE.delivery_service.delivery_service_name.toLowerCase() ==
        "curb side";

    if (__IS_CURB_SIDE_OR_IN_STORE_DELIVERY_SERVICE) {
      const __ORDER_DELIVERY_ADDRESS = await OrderDeliveryAddress.create(
        {
          order_id: __ORDER.id,
          state_id: __STORE_ADDRESS.state_id,
          address_line_1: __STORE_ADDRESS.address_line_1,
          address_line_2: __STORE_ADDRESS.address_line_2,
          landmark: __STORE_ADDRESS.landmark,
          city: __STORE_ADDRESS.city,
          postal_code: __STORE_ADDRESS.postal_code,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    } else {
      if (!__USER_ADDRESS) {
        throw "Please add your address to proceed";
      }

      const __ORDER_DELIVERY_ADDRESS = await OrderDeliveryAddress.create(
        {
          order_id: __ORDER.id,
          state_id: __USER_ADDRESS.state_id,
          address_line_1: __USER_ADDRESS.address_line_1,
          address_line_2: __USER_ADDRESS.address_line_2,
          landmark: __USER_ADDRESS.landmark,
          city: __USER_ADDRESS.city,
          postal_code: __USER_ADDRESS.postal_code,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    //---------------------------
    //---------------------------
    //---------------------------
    //---------------------------
    //---------------------------
    // create code for transaction
    //---------------------------
    //---------------------------
    //---------------------------
    //---------------------------
    //---------------------------

    const __ORDER_TRANSACTION =
      await TransactionController.createOrderTransaction(
        __ORDER,
        __USER,
        __SQL_TRANSACTION
      );

    // // remove items from cart
    // const __REMOVE_CART_ITEMS = await CartItem.update(
    //   { status: "deleted" },
    //   {
    //     where: { id: { [Op.in]: cart_items.map((ci) => ci.cart_item_id) } },
    //     transaction: __SQL_TRANSACTION,
    //   }
    // );
    await TransactionController.confirmOrderTransaction(
      __ORDER_TRANSACTION,
      __ORDER,
      __ORDER_ITEMS,
      store_id,
      __SQL_TRANSACTION
    );
    await MessageController.createOrderMessageHead(__ORDER, __SQL_TRANSACTION);

    // When order is placed successfully convert the is_current_status of __CREATED_ORDER_HISTORY to false
    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __ADMIN_NOTIFICATION = await AdminNotification.create({
          order_id: __ORDER.id,
          is_read: false,
          title: `Store ${__STORE.store_name} have received a new order.`,
          message: `Order placed with order Id : ${__ORDER.id}.`,
          status: "active",
        });

        const __NEW_ORDER_USER_NOTIFICATION = await Notification.create({
          user_id: __ORDER.user_id,
          store_id: __ORDER.store_id,
          order_id: __ORDER.id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: "Your order has been placed successfully.",
          message: `Order placed with order Id : ${__ORDER.id}.`,
          status: "active",
        });
        const notifiableUsers =
          await CommonController.getStoreMangeOrderUserIds(store_id);
        const __NEW_ORDER_STORE_NOTIFICATION = await Notification.bulkCreate(
          notifiableUsers.map((user_id) => {
            return {
              user_id,
              store_id: __ORDER.store_id,
              order_id: __ORDER.id,
              is_notification_for_store: true,
              is_sent: false,
              is_read: false,
              title: "You have received a new order",
              message: `Order received with order Id : ${__ORDER.id}`,
              status: "active",
            };
          })
        );

        // Now send email to user
        const __ORDER_DETAILS = await orderDetails({
          order_id: __ORDER.id,
          store_id,
        });

        SNSController.createAndSendCreateOrderEmails(
          __ORDER_DETAILS.order,
          [__USER.email],
          "Your Order Has Been Successfully Created!",
          `
                Thank you for choosing '${__STORE.store_name}' for your order! We are pleased to inform you that your order has been successfully created. We appreciate your business and look forward to serving you.
                <br>
                Below are the details of your order:`
        );
        // Now send emails to store employees
        const storeEmails = await CommonController.getStoreMangeOrderUserEmails(
          store_id
        );
        SNSController.createAndSendCreateOrderEmails(
          __ORDER_DETAILS.order,
          storeEmails,
          "Your have received a new order",
          `
                We are thrilled to inform you that a new order has been placed on your '${__STORE.store_name}'. Please review the order details below.
                `
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    // remove items from cart
    const __REMOVE_CART_ITEMS = await CartItem.update(
      { status: "deleted" },
      {
        where: { id: { [Op.in]: cart_items.map((ci) => ci.cart_item_id) } },
        transaction: __SQL_TRANSACTION,
      }
    );

    await __SQL_TRANSACTION.commit();
    return { order_id: __ORDER.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

// code for the order_status_name
const listOrders = async function (
  data,
  user_id,
  forStore = false,
  order_id = null
) {
  // data = { store_id, page, page_size, order_by, order_type, order_status_name, from_date, only_active_orders, to_date, is_show_products }
  // for store is use for user_id belongs as store empoyee otherwise user_id belongs to customer
  try {
    const {
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      order_status_name,
      from_date,
      only_active_orders,
      to_date,
      is_show_products,
    } = data;

    const stores = store_id
      ? [{ store_id }]
      : forStore
      ? await (
          await StoreController.getStoresWithManageOrderPermissions(user_id)
        ).stores
      : [];

    const order =
      order_by && order_type
        ? [[sequelize.col(order_by), order_type]]
        : [["id", "DESC"]];

    const whereStores = stores.length
      ? { store_id: { [Op.in]: stores.map((s) => s.store_id) } }
      : forStore
      ? { store_id: null }
      : {};

    const whereOrderStatus = order_status_name
      ? [
          {
            order_status_id: await (
              await OrderStatus.findAll({ where: { order_status_name } })
            ).map((os) => os.id),
          },
        ]
      : [];

    const nonActiveOrderStatusIds = await (
      await OrderStatus.findAll({
        where: {
          order_status_name: {
            [Op.in]: ["completed", "cancelled", "returned"],
          },
        },
      })
    ).map((os) => os.id);

    const notWhereOrderStatuses =
      only_active_orders != null
        ? [
            {
              order_status_id: {
                [only_active_orders ? Op.notIn : Op.in]:
                  nonActiveOrderStatusIds,
              },
            },
          ]
        : [];

    const orderFilter = order_id ? { id: order_id } : {};

    const newWhereOrderStatuses = {
      [Op.and]: [...whereOrderStatus, ...notWhereOrderStatuses],
    };

    const whereUser = forStore ? {} : user_id ? { user_id } : {};
    const includeOrderTransaction = forStore
      ? [
          {
            model: OrderTransaction,
            attributes: {
              include: [["id", "order_transaction_id"]],
              exclude: ["id", "status", "createdAt", "updatedAt"],
            },
          },
        ]
      : [];

    const whereDate =
      from_date && to_date
        ? {
            [Op.and]: [
              {
                createdAt: {
                  [Op.gte]: moment(from_date)
                    .utc()
                    .subtract(1, "days")
                    .toDate(),
                },
              },
              {
                updatedAt: {
                  [Op.lte]: moment(to_date).utc().subtract(1, "days").toDate(),
                },
              },
            ],
          }
        : {};

    const query = {
      attributes: {
        include: [["id", "order_id"]],
        exclude: ["id"],
      },
      where: {
        status: "active",
        ...whereStores,
        ...whereDate,
        ...whereUser,
        ...orderFilter,
      },
      include: [
        ...includeOrderTransaction,
        {
          model: Store,
          required: false,
          attributes: [
            ["id", "store_id"],
            "logo_url",
            "store_name",
            "is_verified",
            "is_enabled",
            "image_url",
          ],
        },
        {
          model: OrderHistory,
          attributes: [
            ["id", "order_history_id"],
            "order_status_id",
            "createdAt",
            "updatedAt",
          ],
          where: { ...newWhereOrderStatuses, is_current_status: true },
          include: [
            {
              model: OrderStatus,
              required: false,
              where: { status: "active" },
              attributes: [["id", "order_status_id"], "order_status_name"],
            },
          ],
        },
        {
          model: OrderItem,
          attributes: {
            include: [["id", "order_item_id"]],
            exclude: ["id"],
          },
        },
        {
          model: OrderDeliveryAddress,
          attributes: {
            include: [["id", "order_delivery_address_id"]],
            exclude: ["id", "status", "createdAt", "updatedAt"],
          },
        },
      ],
    };

    if (!(page && page_size)) {
      const __ORDERS = await Order.findAll({
        ...query,
        order,
      });

      const orders = __ORDERS.map((o) => {
        const order = o.toJSON();
        const store = order.store;
        const storeImage = S3Controller.getAwsS3SignedFileUrl(store.image_url);
        const logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
        store.image = storeImage;
        store.logo = logo;
        delete store.image_url;
        delete store.logo_url;
        return order;
      });

      return {
        total_count: orders.length,
        orders,
      };
    }

    const __ORDERS = await CommonController.getPaginationResult({
      Model: Order,
      as: "orders",
      order,
      page,
      page_size,
      query,
    });

    __ORDERS.orders = __ORDERS.orders.map((o) => {
      const order = o.toJSON();
      const store = order.store;
      const storeImage = S3Controller.getAwsS3SignedFileUrl(store?.image_url);
      const logo = S3Controller.getAwsS3SignedFileUrl(store?.logo_url);
      store.image = storeImage;
      store.logo = logo;
      delete store?.image_url;
      delete store?.logo_url;
      return order;
    });

    return __ORDERS;
  } catch (err) {
    throw err;
  }
};

const listStoreOrders = async function (data, user_id) {
  // data = {store_id, page, page_size, order_by, order_type, only_active_orders, order_statuses}
  // order_statuses = [{order_status_name}]
  try {
    let {
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      only_active_orders,
      order_statuses,
      from_date,
      to_date,
    } = data;

    // if(store_id) {
    //     const userStores = await StoreController.getStorePermissions(user_id);

    //     const store = await userStores.stores.find(store => store.store_id == store_id)
    //     const isUserHasPermission = store.controllers.find(c => {
    //         return c.controller_key == "MANAGE_ORDER" || c.controller_key == "MANAGE_RETURN_ORDER"
    //     })

    //     if(!isUserHasPermission) {
    //         throw "You do not permission to manage the orders for this store."
    //     }

    // }

    if (order_statuses && order_statuses.length) {
      const filterOrderStatusNames = order_statuses
        .filter((os) => !os.as)
        .map((os) => os.order_status_name);
      if (filterOrderStatusNames) {
        return await listOrders(
          { ...data, order_status_name: { [Op.in]: filterOrderStatusNames } },
          user_id,
          true
        );
      }
    } else {
      return await listOrders({ ...data }, user_id, true);
    }
  } catch (err) {
    throw err;
  }
};

const listStoreActiveOrders = async function (data, user_id) {
  // data = {store_id, page, page_size, order_by, order_type}
  try {
    const { store_id, page, page_size, order_by, order_type } = data;
    const order_statuses = await OrderStatus.findAll({
      where: {
        order_status_name: {
          [Op.notIn]: ["created", "delivered", "cancelled"],
        },
      },
    });

    let orders = {
      new: [],
      pending: [],
      received: [],
    };

    if (order_statuses && order_statuses.length) {
      for (let i = 0; i < order_statuses.length; i++) {
        const os = order_statuses[i];
        const __ORDERS = await listOrders(
          { ...data, only_active_orders: true, order_status_id: os.id },
          user_id,
          true
        );
        const __ORDER_STATUS = await OrderStatus.findOne({
          where: { id: os.id },
        });

        const key = orders[__ORDER_STATUS.order_status_name]
          ? __ORDER_STATUS.order_status_name
          : "received";
        orders[key] = [...orders[key], ...__ORDERS];
      }
      return orders;
    }

    return { ...orders };
  } catch (err) {
    throw err;
  }
};

const listUserOrders = async function (data, user_id) {
  // data = {store_id, page, page_size, order_by, order_type, only_active_orders, order_statuses, from_date, to_date}
  // order_statuses = [{order_status_name, as}]
  try {
    const {
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      only_active_orders,
      order_statuses,
      from_date,
      to_date,
    } = data;

    if (order_statuses.length) {
      const filterOrderStatusNames = order_statuses
        .filter((os) => !os.as)
        .map((os) => os.order_status_name);
      if (filterOrderStatusNames) {
        return await listOrders(
          { ...data, order_status_name: { [Op.in]: filterOrderStatusNames } },
          user_id,
          false
        );
      }
    } else {
      return await listOrders({ ...data }, user_id, false);
    }
  } catch (err) {
    throw err;
  }
};

const orderDetails = async function (data, user_id = null) {
  // data = {order_id, store_id}
  try {
    const { order_id, store_id } = data;
    const user = user_id ? { user_id } : {};

    const __ORDER = await Order.findOne({
      where: { id: order_id, store_id, status: "active", ...user },
      attributes: {
        include: [["id", "order_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: OrderTransaction,
          attributes: {
            include: [["id", "order_transaction_id"]],
            exclude: ["id"],
          },
        },
        {
          model: DeliveryService,
          attributes: {
            include: [["id", "delivery_service_id"]],
            exclude: ["id", "createdAt", "updatedAt", "is_enabled", "status"],
          },
        },
        {
          model: OrderHistory,
          required: true,
          attributes: [
            ["id", "order_history_id"],
            "is_created_by_store",
            "order_status_id",
            "is_current_status",
            "createdAt",
            "updatedAt",
          ],
          include: [
            {
              model: OrderStatus,
              required: false,
              attributes: [
                ["id", "order_status_id"],
                "order_status_name",
                "order_state_number",
              ],
            },
          ],
        },
        {
          model: OrderDeliveryAddress,
          attributes: {
            include: [["id", "order_delivery_address_id"]],
            exclude: ["id", "status", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: State,
              required: false,
              attributes: [["id", "state_id"], "state_name"],
              include: [
                {
                  model: Country,
                  required: false,
                  attributes: [["id", "country_id"], "country_name"],
                },
              ],
            },
          ],
        },
        {
          model: OrderItem,
          attributes: {
            include: [["id", "order_item_id"]],
            exclude: ["id"],
          },
          include: [
            {
              model: Product,
              include: [
                {
                  model: ProductImage,
                  required: false,
                  attributes: {
                    include: [["id", "product_image_id"]],
                    exclude: ["id"],
                  },
                  order: [["order", "ASC"]],
                  where: { status: "active" },
                  limit: 1,
                },
                {
                  model: ProductReview,
                  required: false,
                  attributes: {
                    include: [["id", "product_review_id"]],
                    exclude: ["id"],
                  },
                  where: {
                    order_id,
                    status: "active",
                    ...user,
                  },
                },
              ],
            },
            {
              model: ReturnOrderItem,
              where: { status: "active" },
              required: false,
              attributes: {
                include: [["id", "return_order_item_id"]],
                exclude: ["id"],
              },
            },
          ],
        },
      ],
    });

    if (!__ORDER) {
      throw "Order not found";
    }

    const order = __ORDER.toJSON();
    order.order_items = order.order_items.map((item) => {
      item.product.product_id = item.product.id;

      delete item.product.id;
      if (!item?.product?.product_images) {
        return item;
      }

      item.enable_return_button = item.product.is_product_returnable
        ? item.return_order_items.length
          ? false
          : moment(order.createdAt)
              .utc()
              .add("days", item.product.return_days_count) > moment().utc()
        : false;

      item.product.product_images = item.product.product_images.map((img) => {
        img.image = S3Controller.getAwsS3SignedFileUrl(img.image_url);
        return img;
      });

      item.offer_price =
        item.order_item_price -
        CommonController.getCalculateOffset(
          item.order_item_price,
          item.discount_type,
          item.discount_value
        );

      return item;
    });

    order.order_items.sort(
      (a, b) => parseInt(a.order_item_id) - parseInt(b.order_item_id)
    );

    if (!user_id) {
      const __USER_PROOF = await UserProof.findOne({
        where: { user_id: order.user_id, status: "active" },
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

        return { order, user_proof: Object.assign({ image }, userProof) };
      } else {
        return { order, user_proof: null };
      }
    }
    const sentNotification = await Notification.findOne({
      where: { order_id: order_id, is_sent: true },
    });
    return { order, sentNotification };
  } catch (err) {
    throw err;
  }
};

const getOrderUserProofDetails = async function (data) {
  // data = {store_id, order_id}
  try {
    const { store_id, order_id } = data;
    const order = await isStoreOrder(store_id, order_id);

    const __ORDER_USER_PROOF = await UserProof.findOne({
      where: {
        user_id: order.user_id,
        status: "active",
      },
      attributes: {
        include: [["id", "user_proof_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: ProofType,
          where: { status: "active" },
          attributes: {
            include: [["id", "proof_type_id"]],
            exclude: ["id"],
          },
        },
      ],
    });

    if (__ORDER_USER_PROOF) {
      const userProof = __ORDER_USER_PROOF.toJSON();
      const image = S3Controller.getAwsS3SignedFileUrl(userProof.image_url);
      delete userProof.image_url;

      return { user_proof: Object.assign({ image }, userProof) };
    }

    return { user_proof: null };
  } catch (err) {
    throw err;
  }
};

const isStoreOrder = async function (store_id, order_id) {
  try {
    const __ORDER = await Order.findOne({
      where: { store_id, id: order_id, status: "active" },
      include: [
        { model: Store },
        {
          model: OrderDeliveryAddress,
          include: [{ model: State, include: [{ model: Country }] }],
        },
      ],
    });
    if (!__ORDER) {
      throw "Order not found";
    }
    return __ORDER;
  } catch (err) {
    throw err;
  }
};

const isUserOrder = async function (user_id, store_id, order_id) {
  try {
    const __ORDER = await Order.findOne({
      where: { store_id, user_id, id: order_id, status: "active" },
      include: [
        { model: Store },
        {
          model: OrderDeliveryAddress,
          include: [{ model: State, include: [{ model: Country }] }],
        },
      ],
    });
    if (!__ORDER) {
      throw "Order not found";
    }
    return __ORDER;
  } catch (err) {
    throw err;
  }
};

const isOrderHistoryExists = async function (
  order_id,
  orderStatus = {},
  throwErr = ""
) {
  try {
    const __ORDER_HISTORY = await OrderHistory.findOne({
      where: {
        order_id,
        order_status_id: orderStatus.id,
        status: "active",
      },
      include: [
        {
          model: OrderStatus,
          require: true,
        },
      ],
    });

    if (throwErr != "" && __ORDER_HISTORY) {
      throw throwErr;
    }

    if (throwErr != "" || !__ORDER_HISTORY) {
      const isGreaterOrderStatusExists = await OrderHistory.findOne({
        where: { order_id, status: "active" },
        include: [
          {
            model: OrderStatus,
            where: {
              order_state_number: {
                [Op.gt]: orderStatus.order_state_number,
              },
            },
            order: [["order_state_number", "DESC"]],
          },
        ],
      });
    }

    return __ORDER_HISTORY;
  } catch (err) {
    throw err;
  }
};

const getOrderStatus = async function (order_status_name) {
  try {
    const __ORDER_STATUS = await OrderStatus.findOne({
      where: { order_status_name, status: "active" },
    });
    if (!__ORDER_STATUS) {
      throw `'${order_status_name}' order status not found`;
    }
    return __ORDER_STATUS;
  } catch (err) {
    throw err;
  }
};

const updateOrder = async function (
  order_id,
  order_status_id,
  is_created_by_store,
  __SQL_TRANSACTION
) {
  try {
    await OrderHistory.update(
      { is_current_status: false },
      {
        where: { order_id },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __NEW_ORDER_HISTORY = await OrderHistory.create(
      {
        order_id,
        order_status_id,
        is_current_status: true,
        is_created_by_store,
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );

    return __NEW_ORDER_HISTORY;
  } catch (err) {
    throw err;
  }
};

const createPendingOrder = async function (data) {
  // data = {order_id, store_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { order_id, store_id } = data;
    const __PENDING_ORDER_STATUS = await getOrderStatus("pending");

    const __ORDER = await isStoreOrder(store_id, order_id);
    const __ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __PENDING_ORDER_STATUS
    );

    if (!__ORDER_HISTORY) {
      await updateOrder(order_id, __PENDING_ORDER_STATUS.id, __SQL_TRANSACTION);
    }

    __SQL_TRANSACTION.commit();
    return { is_pending_order_created: true };
  } catch (err) {
    __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const confirmOrder = async function (data) {
  // data = {order_id, store_id, order_items}
  // order_items = [{order_item_id}]
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { order_id, store_id, order_items } = data;
    const __ORDER = await isStoreOrder(store_id, order_id);
    const __CONFIRM_ORDER_STATUS = await getOrderStatus("in progress");

    const __ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __CONFIRM_ORDER_STATUS
    );
    // update the status of order_items
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "in progress",
      },
      {
        where: {
          id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __ORDER_ITEMS = await OrderItem.findAll({
      where: {
        order_id,
        id: { [Op.in]: order_items.map((oi) => oi.order_item_id) },
      },
      include: [{ model: Product }],
    });

    if (!__ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __CONFIRM_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );

      const __ORDER_HISTORY_NOTIFICATION = await Notification.create(
        {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `Your order #${order_id}  has been confirmed.`,
          message: `Order Id : '${order_id}' is confirmed.`,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        SNSController.sendOrderStatusEmail(
          __ORDER,
          __ORDER_ITEMS,
          [__USER.email],
          `Order in Progress`,
          `We wanted to provide you with an update regarding your order, which is currently in progress and being prepared. We are working diligently to ensure that your order is processed and delivered to you in a timely manner.`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_confirmed_order: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const createCancelOrderRequest = async function (data, user_id) {
  // data = {store_id, order_id}
  try {
    const { store_id, order_id } = data;
    const __ORDER = await isUserOrder(user_id, store_id, order_id);
    const __ORDER_ITEMS = await OrderItem.findAll({ where: { order_id } });

    const __CONFIRM_ORDER_STATUS = await getOrderStatus("confirmed");
    const __ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __CONFIRM_ORDER_STATUS
    );

    if (__ORDER_HISTORY) {
      throw "Order once confirmed can not be reversed";
    }

    return cancelOrder({
      store_id,
      order_id,
      order_items: __ORDER_ITEMS.map((item) => {
        return { order_item_id: item.id };
      }),
    });
  } catch (err) {
    throw err;
  }
};

const cancelOrder = async function (data) {
  // data = {store_id, order_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id } = data;
    const __ORDER = await isStoreOrder(store_id, order_id);

    // find any order_item as confimed or delivered
    const __CONFIRM_OR_DELIVER_ORDER_ITEMS_MATCH = await OrderItem.findAll({
      where: {
        order_id,
        [Op.or]: [
          { order_item_status: "in progress" },
          { order_item_status: "completed" },
          { order_item_status: "returned" },
          { order_item_status: "in transit" },
          { order_item_status: "ready for pickup" },
        ],
      },
    });

    if (__CONFIRM_OR_DELIVER_ORDER_ITEMS_MATCH.length) {
      throw "Items once confirmed can not be reversed";
    }

    const __CANCELLED_ORDER_STATUS = await getOrderStatus("cancelled");

    //update all order items as cancelled
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "cancelled",
      },
      {
        where: {
          order_id,
          status: "active",
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { order_id },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __STORE = await Store.findOne({ where: { id: store_id } });
    const __ORDER_NOTIFICATION = await Notification.create(
      {
        user_id: __ORDER.user_id,
        store_id,
        order_id,
        is_notification_for_store: false,
        is_sent: false,
        is_read: false,
        title: `Order of Id : '${order_id}' is cancelled.`,
        message: `Your order of Order Id '${order_id}' is cancelled by the store '${__STORE.store_name}'.`,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });

        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Order Cancellation Notification`,
          `We regret to inform you that your order with the following details has been cancelled:
                    <br>
                    Order Number: '${order_id}'
                    <br>
                    Store: '${__STORE.store_name}'`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    const __NEW_ORDER_HISTORY = await updateOrder(
      order_id,
      __CANCELLED_ORDER_STATUS.id,
      true,
      __SQL_TRANSACTION
    );
    await TransactionController.createCancelOrderTransaction(
      order_id,
      __SQL_TRANSACTION
    );

    __SQL_TRANSACTION.commit();
    return { is_cancelled: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const createReadyPickupOrder = async function (data) {
  // data = {store_id, order_id, order_items}
  // order_items = [{order_item_id}]

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id, order_items } = data;
    const __ORDER = await isStoreOrder(store_id, order_id);

    const __ORDER_ITEMS = await OrderItem.findAll({
      where: {
        id: { [Op.in]: order_items.map((oi) => oi.order_item_id) },
        order_id,
        status: "active",
        [Op.or]: [
          { order_item_status: "received" },
          { order_item_status: "in progress" },
        ],
      },
    });

    if (order_items.length != __ORDER_ITEMS.length) {
      throw "Selected items can not be processed";
    }

    const __READY_PICKUP_ORDER_STATUS = await getOrderStatus(
      "ready for pickup",
      true,
      false
    );
    const __SHIPPED_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __READY_PICKUP_ORDER_STATUS
    );

    // update order item status
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "ready for pickup",
      },
      {
        where: {
          id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    if (!__SHIPPED_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __READY_PICKUP_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { id: { [Op.in]: order_items.map((item) => item.order_item_id) } },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __ORDER_HISTORY_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `${item.product.product_name} is ready for pickup.`,
          message: `${item.product.product_name} of order Id : '${order_id}' is ready for pickup.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __STORE = await Store.findOne({
          where: { id: __ORDER.store_id },
        });
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Your Order is Ready for Pickup!`,
          `We are delighted to inform you that your order is now ready for pickup at '${__STORE.store_name}' store. We appreciate your business and are excited to fulfill your order. Please review the details below:`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_ready_for_pickup: true };
  } catch (err) {
    throw err;
  }
};

const createUserReadyPickupOrder = async function (data, user_id) {
  // data = {store_id, order_id}

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id } = data;
    const __ORDER = await isUserOrder(user_id, store_id, order_id);

    const __USER_READY_PICKUP = await getOrderStatus("ready for pickup");
    const __USER_READY_PICKUP_HISTORY = await isOrderHistoryExists(
      order_id,
      __USER_READY_PICKUP
    );

    if (!__USER_READY_PICKUP_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __USER_READY_PICKUP.id,
        false,
        __SQL_TRANSACTION
      );
      await OrderHistory.update(
        { is_created_by_store: true },
        { where: { id: __NEW_ORDER_HISTORY.id } }
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: {
        order_id,
        order_item_status: "in progress",
      },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "ready for pickup",
      },
      {
        where: { order_id, order_item_status: "in progress" },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __USER = await User.findOne({ where: { id: __ORDER.user_id } });

    const __ORDER_NOTIFICATION = await Notification.create(
      {
        user_id: __ORDER.user_id,
        store_id,
        order_id,
        is_notification_for_store: true,
        is_sent: false,
        is_read: false,
        title: `${__USER.first_name} reach the destination for pickup.`,
        message: `${__USER.first_name} is ready to pickup the Order for Order Id '${order_id}'.`,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __STORE = await Store.findOne({
          where: { id: __ORDER.store_id },
        });
        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Order Ready for Customer Pickup - Action Required`,
          `${__USER.first_name} is ready to pickup the Order for Order Id '${order_id}'
                    We are pleased to notify you that an order is now ready for customer '${__USER.first_name}' pickup at your '${__STORE.store_name}' store. Please prepare the following items for the customer to ensure a smooth and efficient pickup process:`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_ready_for_pickup: true };
  } catch (err) {
    throw err;
  }
};

const shippedOrder = async function (data) {
  // data = {store_id, order_id, order_items}
  // order_items = [{order_item_id}]

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id, order_items } = data;
    const __ORDER = await isStoreOrder(store_id, order_id);

    const __ORDER_ITEMS = await OrderItem.findAll({
      where: {
        id: { [Op.in]: order_items.map((oi) => oi.order_item_id) },
        order_id,
        status: "active",
        [Op.or]: [
          { order_item_status: "received" },
          { order_item_status: "in progress" },
        ],
      },
    });

    if (order_items.length != __ORDER_ITEMS.length) {
      throw "Selected items can not be processed";
    }

    const __SHIPPED_ORDER_STATUS = await getOrderStatus("in transit");
    const __SHIPPED_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __SHIPPED_ORDER_STATUS
    );

    // update order item status
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "in transit",
      },
      {
        where: {
          id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    if (!__SHIPPED_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __SHIPPED_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { id: { [Op.in]: order_items.map((item) => item.order_item_id) } },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __ORDER_HISTORY_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `${item.product.product_name} has been shipped.`,
          message: `${item.product.product_name} of order Id : '${order_id}' has been shipped.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Your Order Has Been Shipped`,
          `We are delighted to inform you that your order has been shipped and is on its way to you! We are excited to fulfill your order and provide you with a smooth delivery experience.`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_shipped: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const deliverOrder = async function (data) {
  // data = {store_id, order_id, order_items}
  // order_items = [{order_item_id}]

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id, order_items } = data;
    const __ORDER = await isStoreOrder(store_id, order_id);

    const __ORDER_ITEMS = await OrderItem.findAll({
      where: {
        [Op.or]: [
          { order_item_status: { [Op.ne]: "cancelled" } },
          { order_item_status: { [Op.ne]: "completed" } },
          { order_item_status: { [Op.ne]: "returned" } },
        ],
        order_id,
        status: "active",
      },
    });

    // update order item status
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "completed",
      },
      {
        where: {
          id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __DELIVERED_ORDER_STATUS = await getOrderStatus("completed");
    const __DELIVERED_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __DELIVERED_ORDER_STATUS
    );

    let currentStoreBalance = await CommonController.getStoreBalance(store_id);

    if (!__DELIVERED_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __DELIVERED_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
      currentStoreBalance =
        await TransactionController.createStoreOrderTransctionAndReturnBalance(
          store_id,
          order_id,
          __SQL_TRANSACTION
        );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { id: { [Op.in]: order_items.map((item) => item.order_item_id) } },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __USER_ORDER_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `${item.product.product_name} has been delivered.`,
          message: `${item.product.product_name} of order Id : '${order_id}' is delivered.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __STORE_USER_NOTIFICATIONS = [];
    const notifiableUsers = await CommonController.getStoreMangeOrderUserIds(
      store_id
    );
    notifiableUsers.forEach((user_id) => {
      __NOTIFICATION_ITEMS.forEach((item) => {
        __STORE_USER_NOTIFICATIONS.push({
          user_id,
          store_id,
          order_id,
          is_notification_for_store: true,
          is_sent: false,
          is_read: false,
          title: `${item.product.product_name} has been delivered.`,
          message: `${item.product.product_name} of order Id : '${order_id}' is delivered.`,
          status: "active",
        });
      });
    });

    const __STORE_ORDER_NOTIFICATION = await Notification.bulkCreate(
      __STORE_USER_NOTIFICATIONS,
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    // now create refund of the orders

    const __CANCELLABLE_ITEMS = await OrderItem.findAll({
      where: {
        order_id,
        id: { [Op.notIn]: order_items.map((oi) => oi.order_item_id) },
      },
      include: [{ model: Product }],
    });

    if (__CANCELLABLE_ITEMS.length) {
      const result = await OrderItem.update(
        { order_item_status: "cancelled" },
        {
          where: { id: { [Op.in]: __CANCELLABLE_ITEMS.map((ci) => ci.id) } },
          transaction: __SQL_TRANSACTION,
        }
      );
      await TransactionController.createAndConfirmOrderItemCancelTransaction(
        order_id,
        __CANCELLABLE_ITEMS.map((ci) => {
          return { order_item_id: ci.id };
        }),
        currentStoreBalance,
        __SQL_TRANSACTION
      );
    }

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        const __STORE_EMAILS =
          await CommonController.getStoreMangeOrderUserEmails(store_id);

        const uniqueEmails = new Set([__USER.email, ...__STORE_EMAILS]);

        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          uniqueEmails,
          `Order Completion Notification`,
          `We are thrilled to inform you that your order has been successfully completed! We would like to express our sincerest gratitude for choosing 'The Green Mall 420' for your purchase. We hope that our service meet your expectations.
                    `
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_delivered: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const isProductOrderCompleted = async function (order_id, product_id, user_id) {
  try {
    const __ORDER = await Order.findOne({
      where: { id: order_id, user_id, status: "active" },
      include: [
        {
          model: OrderItem,
          required: true,
          where: {
            product_id,
            order_item_status: {
              [Op.in]: [
                "completed",
                "return request",
                "return confirmed",
                "returned",
              ],
            },
            status: "active",
          },
        },
      ],
    });

    if (!__ORDER) {
      throw "Order not found";
    }

    return __ORDER;
  } catch (err) {
    throw err;
  }
};

const createProductsReview = async function (data, user_id) {
  // data = {product_id, review, rating, order_id}
  try {
    const { order_id, product_id, review, rating } = data;
    const __IS_ORDER_COMPLETED = await isProductOrderCompleted(
      order_id,
      product_id,
      user_id
    );

    const __REVIEW = await ProductReview.create({
      order_id,
      product_id,
      user_id,
      review,
      rating,
      status: "active",
    });

    return { product_review_id: __REVIEW.id };
  } catch (err) {
    throw err;
  }
};

const isUserProductReviewExists = async function (product_id, user_id) {
  try {
    const __IS_REVIEW_EXISTS = await ProductReview.findOne({
      where: { product_id, user_id },
      attributes: {
        include: [["id", "product_review_id"]],
        exclude: ["id"],
      },
    });
    return { review: __IS_REVIEW_EXISTS };
  } catch (err) {
    throw err;
  }
};

// return order
// return order
// return order
// return order
// return order
const isOrderItemsCompleted = async function (
  user_id,
  store_id,
  order_id,
  order_items
) {
  // order_items : {order_item_id}
  try {
    const __DELIVERED_ORDER_STATUS = await getOrderStatus("completed");
    const __ORDER = await Order.findOne({
      where: { id: order_id, store_id, user_id, status: "active" },
      include: [
        {
          model: OrderItem,
          required: true,
          where: {
            id: { [Op.in]: order_items.map((item) => item.order_item_id) },
            status: "completed",
            status: "active",
          },
        },
        {
          model: OrderHistory,
          required: false,
          where: {
            order_status_id: __DELIVERED_ORDER_STATUS.id,
            status: "active",
          },
        },
      ],
    });

    if (!__ORDER) {
      throw "Order not found";
    }

    if (!__ORDER.order_histories.length) {
      throw "Order not completed yet";
    }

    return __ORDER;
  } catch (err) {
    throw err;
  }
};

const createReturnOrderItemsRequest = async function (data, user_id) {
  // data = {store_id, order_id, order_items}
  // order_items = {order_item_id, return_items_count, remarks}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id, order_items } = data;
    const __ORDER = await isOrderItemsCompleted(
      user_id,
      store_id,
      order_id,
      order_items
    );

    const currentDate = moment().utc();
    const orderDate = moment(__ORDER.order_date).utc();

    const __SELECTED_DELIVERED_ORDER_ITEMS = await OrderItem.findAll({
      where: {
        id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        order_item_status: "completed",
        status: "active",
      },
      include: [
        {
          model: Product,
          required: false,
          where: {
            is_product_returnable: true,
            return_days_count: {
              [Op.gte]: currentDate.diff(orderDate, "days"),
            },
          },
        },
      ],
    });

    // return __SELECTED_DELIVERED_ORDER_ITEMS

    if (__SELECTED_DELIVERED_ORDER_ITEMS.length != order_items.length) {
      throw "Item is not returnable";
    }

    const returnOrderItems = __SELECTED_DELIVERED_ORDER_ITEMS.map((item) => {
      const orderItem = item.toJSON();
      const returnOrderItem = order_items.find(
        (o) => o.order_item_id == item.id
      );
      const returnOrderItemCount = returnOrderItem.return_items_count;

      const totalProductPrice =
        orderItem.order_item_price * orderItem.order_item_count;
      const totalDiscount = CommonController.getCalculateOffset(
        totalProductPrice,
        orderItem.discount_type,
        orderItem.discount_value
      );

      const taxableItemTotalAmount = totalProductPrice - totalDiscount;

      if (!orderItem.product) {
        throw `Item is not returnable`;
      }

      if (returnOrderItemCount > orderItem.order_item_count) {
        throw `'${orderItem.product.product_name}' has ordered less items than returning counts`;
      }
      return {
        ...returnOrderItem,
        total_amount_reversed: totalProductPrice - totalDiscount,
        status: "active",
      };
    });

    const __RETURN_ORDER_ITEMS = await ReturnOrderItem.bulkCreate(
      returnOrderItems,
      { transaction: __SQL_TRANSACTION }
    );

    await OrderItem.update(
      {
        order_item_status: "return request",
      },
      {
        where: { id: { [Op.in]: order_items.map((oi) => oi.order_item_id) } },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __RETURN_ORDER_REQUEST_STATUS = await OrderStatus.findOne({
      where: { order_status_name: "return request", status: "active" },
    });
    const __RETURN_REQUEST_HISTORY = await isOrderHistoryExists(
      order_id,
      __RETURN_ORDER_REQUEST_STATUS
    );

    if (!__RETURN_REQUEST_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __RETURN_ORDER_REQUEST_STATUS.id,
        false,
        __SQL_TRANSACTION
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { id: { [Op.in]: order_items.map((item) => item.order_item_id) } },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __USER_ORDER_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `You return request has successfully submitted.`,
          message: `${item.product.product_name} of order Id : '${order_id}' requested for return.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __STORE_USER_NOTIFICATIONS = [];
    const notifiableUsers = await CommonController.getStoreMangeOrderUserIds(
      store_id
    );
    notifiableUsers.forEach((user_id) => {
      __NOTIFICATION_ITEMS.forEach((item) => {
        __STORE_USER_NOTIFICATIONS.push({
          user_id,
          store_id,
          order_id,
          is_notification_for_store: true,
          is_sent: false,
          is_read: false,
          title: `You have received a return request.`,
          message: `${item.product.product_name} of order Id : '${order_id}' requested for return.`,
          status: "active",
        });
      });
    });

    const __STORE_ORDER_NOTIFICATION = await Notification.bulkCreate(
      __STORE_USER_NOTIFICATIONS,
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        const __STORE_EMAILS =
          await CommonController.getStoreMangeOrderUserEmails(store_id);

        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Return Request Sent Successfully`,
          `We want to inform you that your return request for the following order has been successfully submitted:
                    `
        );

        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [...__STORE_EMAILS],
          `New Return Request Received`,
          `We would like to inform you that a new return request has been received for the '${__ORDER.store.store_name}' store of the following order:`
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { return_order_item_status: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const confirmReturnOrderItemRequest = async function (data) {
  // data = {store_id, order_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id } = data;

    const __ORDER = await isStoreOrder(store_id, order_id);

    const __CONFIRM_RETURN_ORDER_STATUS = await getOrderStatus(
      "return confirmed"
    );
    const __CONFIRM_RETURN_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __CONFIRM_RETURN_ORDER_STATUS
    );

    if (!__CONFIRM_RETURN_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __CONFIRM_RETURN_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { order_id },
      include: [
        {
          model: Product,
        },
        {
          model: ReturnOrderItem,
        },
      ],
    });

    const __USER_ORDER_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `Your return request is confirmed.`,
          message: `Return of ${item.product.product_name} is confirmed.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        const __STORE_EMAILS =
          await CommonController.getStoreMangeOrderUserEmails(store_id);
        __NOTIFICATION_ITEMS.forEach((item) => {
          SNSController.sendOrderStatusEmail(
            __ORDER,
            [item],
            [__USER.email],
            `Your return request is confirmed`,
            `Return of ${item.product.product_name} is confirmed`
          );
        });
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_return_confirmed: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const cancelReturnOrderRequest = async function (data, user_id = null) {
  // data = {store_id, order_id}

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id } = data;

    const __ORDER = await isStoreOrder(store_id, order_id);
    if (user_id) {
      await isUserOrder(user_id, store_id, order_id);
    }

    const __CANCEL_RETURN_ORDER_STATUS = await getOrderStatus(
      "return cancelled"
    );
    const __CANCEL_RETURN_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __CANCEL_RETURN_ORDER_STATUS,
      "Return is already cancelled"
    );

    const __COMPLETED_RETURN_ORDER_STATUS = await getOrderStatus("returned");
    const __COMPLETED_RETURN_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __COMPLETED_RETURN_ORDER_STATUS,
      "Return is completed, and can not be reversed"
    );

    if (!__CANCEL_RETURN_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __CANCEL_RETURN_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
    }

    const __ORDER_NOTIFICATION = await Notification.create(
      {
        user_id: __ORDER.user_id,
        store_id,
        order_id,
        is_notification_for_store: false,
        is_sent: false,
        is_read: false,
        title: "Your return request is rejected.",
        message: `Order Id : '${order_id}'.`,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { order_id, order_item_status: "return request" },
    });

    await OrderItem.update(
      {
        order_item_status: "return cancelled",
      },
      {
        where: { order_id, order_item_status: "return request" },
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        SNSController.sendOrderStatusEmail(
          __ORDER,
          __NOTIFICATION_ITEMS,
          [__USER.email],
          `Return Request Rejected`,
          `We regret to inform you that your return request for the following order has been rejected:
                    `
        );
      } catch (err) {
        // logger.log(err)
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_return_cancelled: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const completeReturnRequest = async function (data) {
  //data = {store_id, order_id, order_items}
  // order_items = {order_item_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id, order_id, order_items } = data;

    const __ORDER = await isStoreOrder(store_id, order_id);

    const __COMPLETE_RETURN_ORDER_STATUS = await getOrderStatus("returned");
    const __COMPLETE_RETURN_ORDER_HISTORY = await isOrderHistoryExists(
      order_id,
      __COMPLETE_RETURN_ORDER_STATUS
    );

    // update order item status
    const __UPDATE_ORDER_ITEM_STATUS = await OrderItem.update(
      {
        order_item_status: "returned",
      },
      {
        where: {
          order_id,
          id: { [Op.in]: order_items.map((item) => item.order_item_id) },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __ORDER_ITEMS = await OrderItem.findAll({
      where: {
        order_id,
        id: { [Op.in]: order_items.map((item) => item.order_item_id) },
      },
      include: [
        {
          model: ReturnOrderItem,
        },
      ],
    });

    if (order_items.length) {
      const __RETURN_ITEM_TRANSACTION =
        await TransactionController.createReturnOrderTransction(
          order_id,
          __ORDER_ITEMS,
          __SQL_TRANSACTION
        );
    }

    if (!__COMPLETE_RETURN_ORDER_HISTORY) {
      const __NEW_ORDER_HISTORY = await updateOrder(
        order_id,
        __COMPLETE_RETURN_ORDER_STATUS.id,
        true,
        __SQL_TRANSACTION
      );
    }

    const __NOTIFICATION_ITEMS = await OrderItem.findAll({
      where: { id: { [Op.in]: order_items.map((item) => item.order_item_id) } },
      include: [
        {
          model: Product,
        },
      ],
    });

    const __NON_RETURNABLE_ITEMS = await OrderItem.findAll({
      where: {
        order_id,
        id: { [Op.notIn]: __ORDER_ITEMS.map((item) => item.order_item_id) },
      },
      include: [
        {
          model: ReturnOrderItem,
        },
        {
          model: Product,
        },
      ],
    });

    const __CANCELLED_RETURN_ITEM = await ReturnOrderItem.update(
      {
        status: "deleted",
      },
      {
        where: { id: { [Op.in]: __NON_RETURNABLE_ITEMS.map((roi) => roi.id) } },
        transaction: __SQL_TRANSACTION,
      }
    );

    await OrderItem.update(
      {
        order_item_status: "return cancelled",
      },
      {
        where: {
          id: {
            [Op.in]: __NON_RETURNABLE_ITEMS.map((roi) => roi.order_item_id),
          },
        },
        transaction: __SQL_TRANSACTION,
      }
    );

    const __USER_ORDER_RETURN_NOTIFICATION = await Notification.bulkCreate(
      __NOTIFICATION_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `Your return has been completed.`,
          message: `Return of ${item.product.product_name} is completed.`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __USER_ORDER_NON_RETURN_NOTIFICATION = await Notification.bulkCreate(
      __NON_RETURNABLE_ITEMS.map((item) => {
        return {
          user_id: __ORDER.user_id,
          store_id,
          order_id,
          is_notification_for_store: false,
          is_sent: false,
          is_read: false,
          title: `Your return request is rejected`,
          message: `Return of ${item.product.product_name} is rejected`,
          status: "active",
        };
      }),
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    __SQL_TRANSACTION.afterCommit(async () => {
      try {
        const __USER = await User.findOne({ where: { id: __ORDER.user_id } });
        const __STORE_EMAILS =
          await CommonController.getStoreMangeOrderUserEmails(store_id);
        if (__NOTIFICATION_ITEMS.length) {
          SNSController.sendOrderStatusEmail(
            __ORDER,
            __NOTIFICATION_ITEMS,
            [__USER.email],
            `Your return has been completed`,
            `Return of ${item.product.product_name} is completed`
          );
        }

        if (__NON_RETURNABLE_ITEMS.length) {
          SNSController.sendOrderStatusEmail(
            __ORDER,
            __NON_RETURNABLE_ITEMS,
            [__USER.email],
            `Return Process Completed`,
            `We are pleased to inform you that the return process for your order has been successfully completed. We appreciate your patience and cooperation throughout this process.
                        `
          );
        }
      } catch (err) {
        // logger.log(err);
      }
    });

    await __SQL_TRANSACTION.commit();
    return { is_return_completed: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

// admin
// admin
// admin
// admin
// admin
// admin

const admin_listOrders = async function (data) {
  // data = { order_id, store_id, page, page_size, order_by, order_type, order_statuses, from_date, to_date}
  // order_statuses = [{order_status_name}]
  try {
    const {
      order_id,
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      order_statuses,
      from_date,
      to_date,
    } = data;
    const filterOrderStatusNames = order_statuses
      .filter((os) => !os.as)
      .map((os) => os.order_status_name);

    if (filterOrderStatusNames.length) {
      return await listOrders(
        {
          ...data,
          order_status_name: { [Op.in]: filterOrderStatusNames },
          only_active_orders: null,
        },
        null,
        false,
        order_id == "" || !order_id ? null : order_id
      );
    } else {
      return await listOrders(
        {
          ...data,
          only_active_orders: null,
        },
        null,
        false,
        order_id == "" || !order_id ? null : order_id
      );
    }
  } catch (err) {
    throw err;
  }
};

const admin_saveOrderServiceCharge = async function (data) {
  // data = {service_charge_type, service_charge_value}
  try {
    const { service_charge_type, service_charge_value } = data;

    const __ORDER_SERVICE_CHARGE = await OrderServiceCharge.findOne({
      where: { status: "active" },
    });

    if (!__ORDER_SERVICE_CHARGE) {
      await OrderServiceCharge.create({
        service_charge_type,
        service_charge_value,
        status: "active",
      });
    } else {
      await OrderServiceCharge.update(
        {
          service_charge_type,
          service_charge_value,
        },
        {
          where: { status: "active" },
        }
      );
    }

    return { is_updated: true };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  iamhereNotification,
  createOrder,
  listStoreOrders,
  listUserOrders,
  orderDetails,
  createCancelOrderRequest,
  cancelOrder,
  confirmOrder,
  createPendingOrder,
  listOrderStatuses,
  shippedOrder,
  deliverOrder,
  listStoreActiveOrders,
  createProductsReview,
  isUserProductReviewExists,
  createReturnOrderItemsRequest,
  confirmReturnOrderItemRequest,
  cancelReturnOrderRequest,
  completeReturnRequest,
  getOrderUserProofDetails,
  createReadyPickupOrder,
  createUserReadyPickupOrder,

  admin_listOrders,
  admin_saveOrderServiceCharge,
};
