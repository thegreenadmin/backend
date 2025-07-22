const { Op } = require("sequelize");
const logger = require("../logger/logger");
const CartItem = require("../models/cart/cart_item.model");
const Product = require("../models/catalogue/product.model");
const ProductImage = require("../models/catalogue/product_image.model");
const DeliveryService = require("../models/delivery/delivery_service.model");
const StoreDeliveryService = require("../models/delivery/store_delivery_service.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const UserAddress = require("../models/user/user_address.model");
const CommonController = require("./common.controller");
const OfferController = require("./offer.controller");
const S3Controller = require("./s3.controller");
const { verifyAddress } = require("./usps.controller");

const createCartItem = async function (data, user_id) {
  // data = {product_id, items_count}
  try {
    const { product_id, items_count } = data;

    console.log(data);

    const __PRODUCT = await Product.findOne({
      where: { id: product_id, status: "active" },
      include: [
        {
          model: Store,
          where: { status: "active" },
        },
      ],
    });

    if (!__PRODUCT) {
      throw "Product not found";
    } else if (!__PRODUCT.is_enabled) {
      throw "Product is not available";
    }

    if (__PRODUCT.store_id) {
      const __NON_ACTIVE_CART_ITEM = await CartItem.findAll({
        where: { user_id, status: "active" },
        include: [
          {
            model: Product,
            where: { store_id: { [Op.ne]: __PRODUCT.store_id } },
          },
        ],
      });

      if (__NON_ACTIVE_CART_ITEM.length) {
        await CartItem.update(
          { status: "deleted" },
          {
            where: {
              id: { [Op.in]: __NON_ACTIVE_CART_ITEM.map((ci) => ci.id) },
            },
          }
        );
      }
    }

    const __PRODUCT_ITEM_ALREADY_EXISTS = await CartItem.findOne({
      where: { product_id, user_id, status: "active" },
    });

    if (__PRODUCT_ITEM_ALREADY_EXISTS) {
      await CartItem.update(
        {
          items_count: __PRODUCT_ITEM_ALREADY_EXISTS.items_count + items_count,
        },
        { where: { id: __PRODUCT_ITEM_ALREADY_EXISTS.id } }
      );
      return { cart_item_id: __PRODUCT_ITEM_ALREADY_EXISTS.id };
    }

    const __CART_ITEM = await CartItem.create({
      product_id,
      items_count,
      user_id,
      status: "active",
    });
    return { cart_item_id: __CART_ITEM.id };
  } catch (err) {
    throw err;
  }
};

const currentlyActiveCart = async function (user_id) {
  try {
    const __CART_ITEM = await CartItem.findOne({
      where: { user_id, status: "active" },
      include: [
        {
          model: Product,
        },
      ],
    });

    const store_id = __CART_ITEM?.product?.store_id;

    if (store_id) {
      return await listStoreCartItems({ store_id }, user_id);
    }
    return {
      store_id: "0",
      cart_items: [],
    };
  } catch (err) {
    throw err;
  }
};

const listStoreCartItems = async function (data, user_id) {
  // data = {store_id, delivery_service_id, user_address_id}
  try {
    const { store_id, store_delivery_service_id, user_address_id } = data;

    const __ORDER_SERVICE_CHARGE =
      await CommonController.getOrderServiceCharge();
    if (!__ORDER_SERVICE_CHARGE) {
      throw "Order Service Charge is unavailable";
    }

    const __STORE_DELIVERY_SERVICE = store_delivery_service_id
      ? await StoreDeliveryService.findOne({
          where: {
            id: store_delivery_service_id,
            store_id,
            is_enabled: true,
            status: "active",
          },
          include: [
            { model: DeliveryService, is_enabled: true, status: "active" },
          ],
        })
      : null;

    const __STORE_ADDRESS = await StoreAddress.findOne({
      where: { store_id, status: "active" },
      include: [{ model: State, include: [{ model: Country }] }],
    });
    const __USER_ADDRESS = user_address_id
      ? await UserAddress.findOne({
          where: { id: user_address_id, user_id, status: "active" },
          include: [{ model: State, include: [{ model: Country }] }],
        })
      : null;

    const __CART_ITEMS = await CartItem.findAll({
      where: { user_id, status: "active" },
      attributes: [["id", "cart_item_id"], "items_count"],
      include: [
        {
          model: Product,
          where: { store_id, is_enabled: true, status: "active" },
          include: [
            {
              model: ProductImage,
              order: [["order", "ASC"]],
              required: false,
              where: { status: "active" },
            },
          ],
        },
      ],
    });

    const __OFFERS = await (
      await OfferController.shop_listStoreOffers(store_id, true)
    ).offers;
    let subTotal = 0.0;
    let totalDiscount = 0.0;

    let totalWeight = 0;

    const cartItems = __CART_ITEMS.map((item) => {
      const cartItem = item.toJSON();
      const productImage = S3Controller.getAwsS3SignedFileUrl(
        cartItem.product?.product_images[0]?.image_url
      );
      const product = Object.assign(
        { product_id: cartItem.product.id, image: productImage },
        cartItem.product
      );

      totalWeight += product.weight; // calculate the weight

      let offer = null;
      // find if any offer for store

      const offers = [];

      const __STORE_OFFER = __OFFERS.find((offer) => offer.is_offer_for_store);

      if (__STORE_OFFER) {
        offers.push(__STORE_OFFER);
        offer = __STORE_OFFER;
        delete offer.offer_products;
      } else {
        for (let i = 0; i < __OFFERS.length; i++) {
          const _offer = __OFFERS[i];
          const __IS_OFFER_PRODUCT = _offer?.offer_products?.find(
            (op) => op.product_id == product.product_id
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

      let itemDiscountOffset = 0;
      if (offer) {
        itemDiscountOffset = CommonController.getCalculateOffset(
          product.selling_price,
          offer.offer_type,
          offer.offer_value
        );
      } else {
        itemDiscountOffset = CommonController.getCalculateOffset(
          product.selling_price,
          product.discount_type,
          product.discount_value
        );
      }

      cartItem.offer_price = product.selling_price - itemDiscountOffset;

      delete product.id;
      delete product.product_images;
      delete cartItem.product;

      if (offer?.is_offer_for_store) {
        cartItem.total_discount = itemDiscountOffset * cartItem.items_count;
      } else {
        cartItem.total_discount = itemDiscountOffset * cartItem.items_count;
      }
      cartItem.total_price = cartItem.offer_price * cartItem.items_count;

      cartItem.offer = offer;
      cartItem.product = product;

      subTotal += product.selling_price * cartItem.items_count;
      totalDiscount += cartItem.total_discount;

      return cartItem;
    });

    let isValidAddress = true;
    let __DELIVERY_CHARGE = 0;
    let isOrderDeliverable = true;

    if (__USER_ADDRESS) {
      isValidAddress = await (
        await verifyAddress(__USER_ADDRESS.toJSON())
      ).result;
    }

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
      isOrderDeliverable = false;
    } else {
      isOrderDeliverable = true;
      __DELIVERY_CHARGE = parseFloat(__DELIVERY_CHARGE_RES.rate);
    }

    const __TAX = __STORE_ADDRESS
      ? await CommonController.getTaxRate(
          __STORE_ADDRESS.toJSON(),
          __USER_ADDRESS ? __USER_ADDRESS.toJSON() : __STORE_ADDRESS.toJSON(),
          store_id,
          subTotal - totalDiscount,
          __DELIVERY_CHARGE
        )
      : await CommonController.getTaxRate(
          null,
          null,
          store_id,
          subTotal - totalDiscount,
          __DELIVERY_CHARGE
        );

    // console.log("__TAX=", __TAX);
    let totalTax = CommonController.getCalculateOffset(
      subTotal - totalDiscount + __DELIVERY_CHARGE,
      __TAX.tax_type,
      __TAX.tax_value
    );

    let totalServiceCharge = CommonController.getCalculateOffset(
      subTotal - totalDiscount + __DELIVERY_CHARGE + totalTax,
      __ORDER_SERVICE_CHARGE.service_charge_type,
      __ORDER_SERVICE_CHARGE.service_charge_value
    );

    const totalAmount =
      subTotal -
      totalDiscount +
      totalTax +
      __DELIVERY_CHARGE +
      totalServiceCharge;

    return {
      store_id,
      cart_total_price: totalAmount,
      cart_sub_total: subTotal,
      cart_total_discount: totalDiscount,
      cart_total_service_charged: totalServiceCharge,
      cart_total_tax: totalTax,
      cart_delivery_service_charge: __DELIVERY_CHARGE,
      is_valid_address: isValidAddress,
      is_order_deliverable: isOrderDeliverable,
      cart_items: cartItems,
    };
  } catch (err) {
    throw err;
  }
};

const updateStoreCartItem = async function (data, user_id) {
  //data = {cart_item_id, items_count}
  try {
    const { cart_item_id, items_count } = data;

    if (items_count <= 0) {
      return deleteStoreCartItem(cart_item_id, user_id);
    }

    const __UPDATE_CART_ITEM = await CartItem.update(
      { items_count },
      { where: { id: cart_item_id, user_id, status: "active" } }
    );

    if (!__UPDATE_CART_ITEM[0]) {
      throw "Cart item not found";
    }

    return { is_updated: true };
  } catch (err) {
    throw err;
  }
};

const deleteStoreCartItem = async function (cart_item_id, user_id) {
  try {
    const __DELETE_CART_ITEM = await CartItem.update(
      { status: "deleted" },
      { where: { id: cart_item_id, user_id, status: "active" } }
    );

    if (!__DELETE_CART_ITEM[0]) {
      throw "Invalid cart item";
    }

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createCartItem,
  listStoreCartItems,
  updateStoreCartItem,
  deleteStoreCartItem,
  currentlyActiveCart,
};
