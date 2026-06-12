const express = require("express");
const router = express.Router();

const { userAuth, permissionAuth } = require("../controllers/auth.controller");
const { createCategory, listCategories, editCategory, createProduct, listStoreProducts, editProduct, listProductsByCategory, getProduct, deleteProduct, getCategoryDetails, deleteCategory, listQuantityTypes, listStoreUserProducts } = require("../controllers/catalogue.controller");
const { checkStoreStatus, isUserBelongsToStore, getStoreBalance, getStoreServiceCharge } = require("../controllers/common.controller");
const { fetchStoreMessageHeads, fetchStoreMessages, storeSendMessage, deleteStoreMessageHead } = require("../controllers/message.controller");
const { createStoreOffer, listStoreOffers, getStoreOfferDetails, listNonOfferProductsForStore, editStoreOffer, deleteStoreOffer } = require("../controllers/offer.controller");
const { listStoreOrders, orderDetails, cancelOrder, createPendingOrder, confirmOrder, deliverOrder, shippedOrder, listStoreActiveOrders, confirmReturnOrderItemRequest, completeReturnRequest, cancelReturnOrderRequest, getOrderUserProofDetails, createReadyPickupOrder} = require("../controllers/order.controller");
const { createStore, createStoreUser, verifyStoreUser, createStoreRole, listStoreRoles, getStoreUserList, getAllControllers, getStoreUser, deleteStoreUser, deleteStoreRole, getUserStores, getStoreDetails, editStoreDetails, editStoreUserDetails, getStoreUserDetailsByStoreUser, getStoreRole, editStoreRole, listDeliveryServices, deleteStore, listStorePages, getStorePageDetails, updateStoreDynamicLink, getStoreOwnerStores, getStorePermissions, showUnClaimStores } = require("../controllers/store.controller");
const { createStoreStripeAccount, createStoreStripeBankAccount, createStripePayout, getStoreConnectedAccount, storeWalletRechargeWithCard } = require("../controllers/stripe.controller");
const { listStoreTransactionHistories, storeTransactionDetails, createMembership, listUserMemberships, getUserMembershipDetails } = require("../controllers/transaction.controller");
const { STORE_CREATED_SUCCESSFULLY, STORE_USER_CREATED_SUCCESSFULLY, STORE_USER_SUCCESSFULLY_VERIFIED, STORE_ROLE_CREATED_SUCCESSFULLY, STORE_ROLES_FETCHED_SUCCESSFULLY, STORE_ROLE_PERMISSION_SUCCESSFULLY_CREATED, STORE_USER_ROLE_CREATED_SUCCESSFULLY, STORE_USERS_FETCHED_SUCCESSFULLY, CONTROLLERS_SUCCESSFULLY_FETCHED, STORE_ROLE_PERMISSIONS_SUCCESSFULLY_FETCHED, STORE_USER_DETAILS_FETCHED_SUCCESSFULLY, STORE_USER_DELETED_SUCCESSFULLY, STORE_ROLE_DELETED_SUCCESSFULLY, STORE_ROLE_PERMISSION_DELETED_SUCCESSFULLY, STORE_USER_ROLE_DELETED_SUCCESSFULLY } = require("../utils/messages.util");
const { sendCreatedResponse, sendConflictResponse, sendOkResponse } = require("../utils/response.util");
const { createStoreValidator, createStoreUserValidator, verifyStoreUserValidator } = require("../validators/store.validator");







router.get('/delivery/service/list', async function (req, res) {
    try{
        const deliveryServices = await listDeliveryServices();
        sendOkResponse(res, deliveryServices, "Delivery services successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})









/**
 * @swagger
 * /api/v1/store/create:
 *   post:
 *     summary: Create a new store
 *     description: Creates a new store for a user with store details
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store successfully created
 */
router.post('/create', userAuth, async function (req, res) {
    try{
        const user = req.payload.user;
        const store = await createStore(req.body, user);

        sendCreatedResponse(res, store, STORE_CREATED_SUCCESSFULLY)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




/**
 * @swagger
 * /api/v1/store/details:
 *   get:
 *     summary: Get store details
 *     description: Get details of a specific store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: store_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Store details successfully fetched
 */
router.get('/details', userAuth, async function(req, res) {
    try{
        const store_id = req.query.store_id;
        const store = await getStoreDetails(store_id);
        sendOkResponse(res, store, "Store details successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.put('/details/edit', userAuth, permissionAuth(["EDIT_STORE"]), async function(req, res) {
    try{
        const editStore = await editStoreDetails(req.body, req.payload.user);
        sendOkResponse(res, editStore, "Store details updated successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.put('/dynamic/link/update', userAuth, permissionAuth(["EDIT_STORE"]), async function(req, res) {
    try{
        const dynamicLink = await updateStoreDynamicLink(req.body);
        sendOkResponse(res, dynamicLink, "Store dynamic link successfully updated")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.delete('/delete', userAuth, permissionAuth(["DELETE_STORE"]), async function(req, res) {
    try{
        const storeDelete = await deleteStore(req.body.store_id);
        sendOkResponse(res, storeDelete, "Store successfully deleted");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});





/**
 * @swagger
 * /api/v1/store/list:
 *   get:
 *     summary: List user stores
 *     description: Get all stores associated with the authenticated user
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Stores successfully fetched
 */
router.get('/list', userAuth, async function (req, res) {
    try{
        const user = req.payload.user;
        const stores = await getUserStores(user.id);

        sendCreatedResponse(res, stores, "Stores successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});


router.get('/list/owners', userAuth, async function(req, res) {
    try{
        const stores = await getStoreOwnerStores(req.payload.user.id);
        sendOkResponse(res, stores, "Stores successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


//pages
//pages
//pages
//pages
//pages


router.get('/page/details', async function(req, res) {
    try{
        const page = await getStorePageDetails(req.query);
        sendOkResponse(res, page, "Store page details successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




//employee
//employee
//employee
//employee
//employee


router.get('/permissions', userAuth, async function(req, res) {
    try{
        const controllers = await getStorePermissions(req.payload.user.id);
        sendOkResponse(res, controllers, "Permissions successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.post('/user/create', userAuth, permissionAuth(["CREATE_STORE_USER"]), async function (req, res) {
    // verify the store_user has permission to create user
    try{
        const storeUser = await createStoreUser(req.body);
        sendCreatedResponse(res, storeUser, STORE_USER_CREATED_SUCCESSFULLY)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.put('/user/edit', userAuth, permissionAuth(["EDIT_STORE_USER"]), async function (req, res) {
    // verify the store_user has permission to create user
    try{
        const storeUser = await editStoreUserDetails(req.body);
        sendCreatedResponse(res, storeUser, "Store user updated successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.delete('/user/delete', userAuth,permissionAuth(["EDIT_STORE_USER"]),  async function(req, res) {
    try{
        const deleteUser = await deleteStoreUser(req.body);
        sendOkResponse(res, deleteUser, STORE_USER_DELETED_SUCCESSFULLY)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.get('/user/verify', verifyStoreUserValidator, async function (req, res) {
    try{
        const store_user_id = req.query.store_user_id;
        const verification_code = req.query.verification_code;

        const verifiedUser = await verifyStoreUser(store_user_id, verification_code);
        res.send(STORE_USER_SUCCESSFULLY_VERIFIED)

    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.get('/user/list', userAuth, permissionAuth(["VIEW_STORE_USERS"]), async function(req, res) {
    try{
        const storeUsers = await getStoreUserList(req.query);
        sendOkResponse(res, storeUsers, STORE_USERS_FETCHED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/user', userAuth, async function(req, res) {
    try{
        const storeStatus = await checkStoreStatus(req.query.store_id);
        const user = req.payload.user;
        const storeUser = await getStoreUser(req.query, user);
        sendOkResponse(res, storeUser, STORE_USER_DETAILS_FETCHED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/user/details', userAuth, permissionAuth(["VIEW_STORE_USERS"]), async function(req, res) {
    try{
        const storeUser = await getStoreUserDetailsByStoreUser(req.query);
        sendOkResponse(res, storeUser, STORE_USER_DETAILS_FETCHED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/role/create', userAuth, permissionAuth(["CREATE_ROLE"]), async function (req, res) {
    // verify the store_user has permission to create the roles
    try{
        const storeRole = await createStoreRole(req.body);
        sendCreatedResponse(res, storeRole, STORE_ROLE_CREATED_SUCCESSFULLY)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/role/list', userAuth, async function (req, res) {
    // verify the store_user has permission to view the roles
    try{
        const __ROLES__ = await listStoreRoles(req.query.store_id);
        sendOkResponse(res, __ROLES__, STORE_ROLES_FETCHED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/role/details', userAuth, async function (req, res) {
    // verify the store_user has permission to view the roles
    try{
        const __ROLES__ = await getStoreRole(req.query);
        sendOkResponse(res, __ROLES__, STORE_ROLES_FETCHED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.put('/role/edit', userAuth, permissionAuth(["EDIT_ROLE", "CREATE_ROLE"]), async function (req, res) {
    // verify the store_user has permission to create the roles
    try{
        const storeRole = await editStoreRole(req.body);
        sendCreatedResponse(res, storeRole, "Permissions updated successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.delete('/role/delete', userAuth, permissionAuth(["EDIT_ROLE"]), async function (req, res) {
    try{
        const deleteRole = await deleteStoreRole(req.body);
        sendOkResponse(res, deleteRole, STORE_ROLE_DELETED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});





router.get('/controller/list', async function (req, res) {
    try{
        const controllers = await getAllControllers();
        sendOkResponse(res, controllers, CONTROLLERS_SUCCESSFULLY_FETCHED)

    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





















//------------------CATALOGUE----------------------------
//------------------CATALOGUE----------------------------
//------------------CATALOGUE----------------------------
//------------------CATALOGUE----------------------------
//------------------CATALOGUE----------------------------
//------------------CATALOGUE----------------------------







router.get('/quantity_type/list', async function(req, res) {
    try{
        const quantityTypes = await listQuantityTypes();
        sendOkResponse(res, quantityTypes, "Quantity types successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




/**
 * @swagger
 * /api/v1/store/category/create:
 *   post:
 *     summary: Create category
 *     description: Create a new product category for the store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - name
 *             properties:
 *               store_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category successfully created
 */
router.post('/category/create', userAuth, permissionAuth(["CREATE_CATEGORY"]), async function(req, res) {
    try{
        const category = await createStoreCategory(req.body, req.payload.user.id);
        sendCreatedResponse(res, category, "Category successfully created")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.get('/category/list', userAuth, async function(req, res) {
    try{
        const isStoreUser = await isUserBelongsToStore(
            req.query.store_id,
            req.payload.user.id
        )
        const categories = await listCategories(req.query);
        sendOkResponse(res, categories, "Categories successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/category/details', userAuth, async function(req, res) {
    try{
        const isStoreUser = await isUserBelongsToStore(
            req.query.store_id,
            req.payload.user.id
        )
        const categories = await getCategoryDetails(req.query);
        sendOkResponse(res, categories, "Category successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.put('/category/edit', userAuth, permissionAuth(["EDIT_CATEGORY"]), async function(req, res) {
    try{
        const category = await editCategory(req.body);
        sendCreatedResponse(res, category, "Category updated successfully");
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.delete('/category/delete', userAuth, permissionAuth(["EDIT_CATEGORY"]), async function(req, res) {
    try{
        const category = await deleteCategory(req.body);
        sendCreatedResponse(res, category, "Category successfully deleted");
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
})














/**
 * @swagger
 * /api/v1/store/product/create:
 *   post:
 *     summary: Create product
 *     description: Create a new product for the store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - category_id
 *               - name
 *               - price
 *             properties:
 *               store_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product successfully created
 */
router.post('/product/create', userAuth, permissionAuth(["CREATE_PRODUCT"]), async function(req, res) {
    try{
        const product = await createStoreProduct(req.body, req.payload.user.id);
        sendCreatedResponse(res, product, "Product successfully created")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/product/list', userAuth, async function(req, res) {
    try{
        if(req.body.store_id) {
            const isStoreUser = await isUserBelongsToStore(
                req.body.store_id,
                req.payload.user.id
            )
        }
        const products = await listStoreUserProducts(req.body, req.payload.user.id);
        sendOkResponse(res, products, "Product list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});








router.get('/product/details', userAuth, async function(req, res) {
    try{
        const isStoreUser = await isUserBelongsToStore(
            req.query.store_id,
            req.payload.user.id
        )
        const products = await getProduct(req.query.store_id, req.query.product_id);
        sendOkResponse(res, products, "Product list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});








router.put('/product/edit', userAuth, permissionAuth(["EDIT_PRODUCT"]), async function(req, res) {
    try{
        const updateProduct = await editProduct(req.body);
        sendOkResponse(res, updateProduct, "Product updated successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});






router.delete('/product/delete', userAuth, permissionAuth(["EDIT_PRODUCT"]), async function(req, res) {
    try{
        const deletedProduct = await deleteProduct(req.body);
        sendOkResponse(res, deletedProduct, "Product successfully deleted");
    }catch(err) {
        sendConflictResponse(res, {}, err)
    }
})






router.post('/offer/create', userAuth, permissionAuth(["CREATE_OFFER"]), async function(req, res) {
    try{
        const offer = await createStoreOffer(req.body);
        sendCreatedResponse(res, offer, "Offer created successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/offer/list', userAuth, async function(req, res) {
    try{
        const offers = await listStoreOffers(req.body, req.payload.user.id);
        sendOkResponse(res, offers, "Offers successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/offer/details', userAuth, async function(req, res) {
    try{
        const offer = await getStoreOfferDetails(req.query);
        sendOkResponse(res, offer, "Offer successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/offer/non_offered_products/list', userAuth, async function(req, res) {
    try{
        const products = await listNonOfferProductsForStore(req.body);
        sendOkResponse(res, products, "Non offered products successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.put('/offer/edit', userAuth, permissionAuth(["EDIT_OFFER"]), async function(req, res) {
    try{
        const offer = await editStoreOffer(req.body);
        sendOkResponse(res, offer, "Offer has been modified successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.delete('/offer/delete', userAuth, permissionAuth(["EDIT_OFFER"]), async function(req, res) {
    try{
        const deletedOffer = await deleteStoreOffer(req.body);
        sendOkResponse(res, deletedOffer, "Offer successfully deleted")

    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})











router.post('/order/list', userAuth, async function(req, res) {
    try{
        const orders = await listStoreOrders(req.body, req.payload.user.id);
        sendOkResponse(res, orders, "Order list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});

/**
 * @swagger
 * /api/v1/store/order/list:
 *   post:
 *     summary: List store orders
 *     description: Get list of orders for a store with filters
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *             properties:
 *               store_id:
 *                 type: integer
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orders successfully fetched
 */
router.post('/order/list', userAuth, async function(req, res) {
    try{
        const orders = await storeOrderList(req.body, req.payload.user.id);
        sendOkResponse(res, orders, "Orders successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.post('/order/active/list', userAuth, async function(req, res) {
    try{
        const orders = await listStoreActiveOrders(req.body, req.payload.user.id);
        sendOkResponse(res, orders, "Order list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});







router.get('/order/details', userAuth, async function(req, res) {
    try{
        const isStoreUser = await isUserBelongsToStore(
            req.query.store_id,
            req.payload.user.id
        )
        const order = await orderDetails(req.query);
        sendOkResponse(res, order, "Order details successfully fetched");

    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.get('/order/user/proof/details', userAuth, async function(req, res) {
    try{

        const isStoreUser = await isUserBelongsToStore(
            req.query.store_id,
            req.payload.user.id
        )

        const proofDetails = await getOrderUserProofDetails(req.query)
        sendOkResponse(res, proofDetails, "User proof details successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/order/pending/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const pendingOrder = await createPendingOrder(req.body);
        sendCreatedResponse(res, pendingOrder, "Order is set to be in pending")
    }catch(err) {
        sendConflictResponse(res, {}, err)
    }
})




router.post('/order/confirm/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const orderConfirm = await confirmOrder(req.body);
        sendCreatedResponse(res, orderConfirm, "Order is successfully confirmed");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})







router.post('/order/cancel/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const orderCancel = await cancelOrder(req.body);
        sendOkResponse(res, orderCancel, "Order successfully cancelled");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/order/shipped/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const orderShipped = await shippedOrder(req.body);
        sendCreatedResponse(res, orderShipped, "Order is successfully shipped");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/order/ready/pickup/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const readyPickupOrder = await createReadyPickupOrder(req.body);
        sendCreatedResponse(res, readyPickupOrder, "Order is ready for pickup");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/order/delivered/create', userAuth, permissionAuth(["MANAGE_ORDER"]), async function(req, res) {
    try{
        const orderDeliver = await deliverOrder(req.body);
        sendOkResponse(res, orderDeliver, "Order successfully delivered");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/order/return/confirm/create', userAuth, permissionAuth(["MANAGE_RETURN_ORDER"]), async function(req, res) {
    try{
        const returnOrderConfirmation = await confirmReturnOrderItemRequest(req.body);
        sendOkResponse(res, returnOrderConfirmation, "Order return comfirmed successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/order/return/cancel/create', userAuth, permissionAuth(["MANAGE_RETURN_ORDER"]), async function(req, res) {
    try{
        const returnOrderCancellation = await cancelReturnOrderRequest(req.body);
        sendOkResponse(res, returnOrderCancellation, "Return request has been rejected.");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.post('/order/return/complete/create', userAuth, permissionAuth(["MANAGE_RETURN_ORDER"]), async function(req, res) {
    try{
        const returnOrderConfirmation = await completeReturnRequest(req.body);
        sendOkResponse(res, returnOrderConfirmation, "Order return completed successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})









// messages
router.get('/message/inbox', userAuth, async function(req, res) {
    try{
        const messageHeads = await fetchStoreMessageHeads(req.query, req.payload.user.id);
        sendOkResponse(res, messageHeads, "Store messages head successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.get('/message/list', userAuth, permissionAuth(["MANAGE_MESSAGE"]), async function(req, res) {
    try{
        const messages = await fetchStoreMessages(req.query);
        sendOkResponse(res, messages, "Store messages successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.delete('/message/delete', userAuth, permissionAuth(["MANAGE_MESSAGE"]), async function(req, res) {
    try{
        const deleteMessage = await deleteStoreMessageHead(req.body);
        sendOkResponse(res, deleteMessage, "Message successfully archived")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/message/send', userAuth, permissionAuth(["MANAGE_MESSAGE"]), async function(req, res) {
    try{
        const messages = await storeSendMessage(req.body);
        sendOkResponse(res, messages, "Store messages successfully send")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})









// stripe
// stripe
// stripe
// stripe
// stripe
// stripe
// stripe

/**
 * @swagger
 * /api/v1/store/stripe/recharge:
 *   post:
 *     summary: Recharge store wallet
 *     description: Recharge store wallet using user's saved card
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_stripe_card_id
 *               - amount
 *               - store_id
 *             properties:
 *               user_stripe_card_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               store_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Store recharged successfully
 */
router.post('/stripe/recharge', userAuth, permissionAuth(['MANAGE_TRANSACTION']), async function(req, res) {
    try{
        const payout = await storeWalletRechargeWithCard(req.body, req.payload.user.id);
        sendCreatedResponse(res, payout, "Store recharged successfully.");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


/**
 * @swagger
 * /api/v1/store/stripe/payout/create:
 *   post:
 *     summary: Create payout to bank account
 *     description: Create a payout from store wallet to user's bank account
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - amount
 *               - user_stripe_bank_id
 *             properties:
 *               store_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               user_stripe_bank_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Payout created successfully
 */
router.post('/stripe/payout/create', userAuth, permissionAuth(['MANAGE_TRANSACTION']), async function(req, res) {
    try{
        const payout = await createStripePayout(req.body, req.payload.user.id);
        sendCreatedResponse(res, payout, "Payout created successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get("/service/charge", userAuth, permissionAuth(['MANAGE_TRANSACTION']), async function(req, res) {
    try{
        const serviceCharge = await getStoreServiceCharge(req.query.store_id);
        sendCreatedResponse(res, serviceCharge, "Service charge fetched successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})

router.get("/unclaimed", userAuth, async function(req, res) {
    try{
        const unclaimedStores = await showUnClaimStores(req.query);
        sendCreatedResponse(res, unclaimedStores, "Unclaimed stores list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


// transactions
// transactions
// transactions
// transactions
// transactions
// transactions
// transactions


router.get('/transaction/list', userAuth, async function(req, res) {
    try{
        const transctionList = await listStoreTransactionHistories(req.query, req.payload.user.id);
        sendOkResponse(res, transctionList, "Transaction history successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/transaction/details', userAuth, permissionAuth(['MANAGE_TRANSACTION']), async function(req, res) {
    try{
        const transctionDetails = await storeTransactionDetails(req.query);
        sendOkResponse(res, transctionDetails, "Transaction history successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






//wallet
//wallet
//wallet
//wallet
//wallet


router.get('/wallet/balance', userAuth, permissionAuth(['MANAGE_TRANSACTION']), async function(req, res) {
    try{
        const balance = await getStoreBalance(req.query.store_id);
        sendCreatedResponse(res, {balance}, "Store wallet balance successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




//membership
router.post('/membership/create', userAuth, async function(req, res) {
    try{
        const membership = await createMembership(req.body, req.payload.user.id);
        sendCreatedResponse(res, membership, "Membership successfully added");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/membership/list', userAuth, async function(req, res) {
    try{
        const memberships = await listUserMemberships(req.query, req.payload.user.id);
        sendCreatedResponse(res, memberships, "Membership list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.get('/membership/details', userAuth, async function(req, res) {
    try{
        const membership = await getUserMembershipDetails(req.query, req.payload.user.id);
        sendCreatedResponse(res, membership, "Membership details successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




module.exports = {storeRouter: router}
