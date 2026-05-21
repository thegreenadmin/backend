const express = require("express");
const { hasUserAuth, userAuth } = require("../controllers/auth.controller");
const {
  createCartItem,
  listStoreCartItems,
  updateStoreCartItem,
  deleteStoreCartItem,
  currentlyActiveCart,
} = require("../controllers/cart.controller");
const {
  shop_listStoreProducts,
  shop_listStoreCategories,
  getProduct,
  shop_getProductDetails,
  shop_listAppHomeProducts,
} = require("../controllers/catalogue.controller");
const {
  shop_listAllStoresOffers,
  shop_listStoreOffers,
  shop_listHomeOffers,
} = require("../controllers/offer.controller");
const {
  shop_getNearbyStores,
  getStoreDetails,
  createClaimStoreRequest,
  shop_StoreDetails,
  shop_PreviousStores,
  shop_FavouriteStores,
} = require("../controllers/store.controller");
const {
  sendConflictResponse,
  sendOkResponse,
  sendCreatedResponse,
} = require("../utils/response.util");
const router = express.Router();

router.post("/stores/list/nearby", async function (req, res) {
  try {
    const userId = req?.payload?.user?.id || null;
    const stores = await shop_getNearbyStores(req.body, userId);
    sendOkResponse(res, stores, "Nearby stores successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/stores/list/previous", userAuth, async function (req, res) {
  try {
    const stores = await shop_PreviousStores(req.query, req.payload.user.id);
    sendOkResponse(res, stores, "Previous stores successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/stores/list/favourite", userAuth, async function (req, res) {
  try {
    const stores = await shop_FavouriteStores(req.query, req.payload.user.id);
    sendOkResponse(res, stores, "Favourite stores successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/details", async function (req, res) {
  try {
    const userId = req?.payload?.user?.id || null;
    const stores = await shop_StoreDetails(req.query, userId);
    sendOkResponse(res, stores, "Store details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/store/claim/create", userAuth, async function (req, res) {
  try {
    const claimStore = await createClaimStoreRequest(
      req.body,
      req.payload.user.id
    );
    sendCreatedResponse(res, claimStore, "Claim request successfully sent");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/category/list", async function (req, res) {
  try {
    const categories = await shop_listStoreCategories(req.query);
    sendOkResponse(res, categories, "Store categories successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/store/product/list", async function (req, res) {
  try {
    const userId = req?.payload?.user?.id || null;
    const products = await shop_listStoreProducts(
      req.body,
      userId
    );
    sendOkResponse(res, products, "Products successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/product/details", async function (req, res) {
  try {
    const userId = req?.payload?.user?.id || null;
    const product = await shop_getProductDetails(
      req.query,
      req.query.product_id,
      userId
    );
    sendOkResponse(res, product, "Product details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/offers/list", async function (req, res) {
  try {
    const offers = await shop_listAllStoresOffers(req.query);
    sendOkResponse(res, offers, "Offers successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/offers/list",  async function (req, res) {
  try {
    const offers = await shop_listStoreOffers(req.query.store_id);
    sendOkResponse(res, offers, "Offers successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/home/offers/list", hasUserAuth, async function (req, res) {
  try {
    const offers = await shop_listHomeOffers(req.query);
    sendOkResponse(res, offers, "Offers successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/home/products/list", async function (req, res) {
  try {
    const products = await shop_listAppHomeProducts(req.query);
    sendOkResponse(res, products, "Products successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/cart/active", hasUserAuth, async function (req, res) {
  try {
    const user_id = req?.payload?.user?.id;
    if (!user_id) {
      return sendOkResponse(res, {}, "Active cart successfully fetched");
    }
    const cartItems = await currentlyActiveCart(req.payload.user.id);
    sendOkResponse(res, cartItems, "Active cart successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/store/cart/item/create", userAuth, async function (req, res) {
  try {
    const cartItem = await createCartItem(req.body, req.payload.user.id);
    sendOkResponse(res, cartItem, "Item successfully added to cart");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/cart/item/list", userAuth, async function (req, res) {
  try {
    const cartItems = await listStoreCartItems(req.query, req.payload.user.id);
    sendOkResponse(res, cartItems, "Cart items successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/store/cart/item/update", userAuth, async function (req, res) {
  try {
    const cartItem = await updateStoreCartItem(req.body, req.payload.user.id);
    sendOkResponse(res, cartItem, "Cart item successfully updated");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/store/cart/item/delete", userAuth, async function (req, res) {
  try {
    const deleteItem = await deleteStoreCartItem(
      req.body.cart_item_id,
      req.payload.user.id
    );
    sendOkResponse(res, deleteItem, "Item has been successfully removed");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

module.exports = { shopRouter: router };
