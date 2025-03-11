const express = require("express");
const { userAuth } = require("../controllers/auth.controller");
const { iamhereNotification,createOrder, listOrderStatuses, listUserOrders, createProductsReview, createReturnOrderItemsRequest, orderDetails, createCancelOrderRequest, getOrderUserProofDetails, cancelReturnOrderRequest, createUserReadyPickupOrder } = require("../controllers/order.controller");
const { sendOkResponse, sendConflictResponse, sendCreatedResponse } = require("../utils/response.util");
const router = express.Router();





router.get('/status/list', async function(req, res) {
    try{
        const orderStatuses = await listOrderStatuses();
        sendOkResponse(res, orderStatuses, "Order statuses successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})
router.post('/iamherenotification', async function(req, res) {
    try{        
        const order = await iamhereNotification(req.body);
        sendCreatedResponse(res, order, "Notification send successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/create', userAuth, async function (req, res) {
    try{
        const order = await createOrder(req.body, req.payload.user.id);
        sendCreatedResponse(res, order, "Order successfully created");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});





router.post('/list', userAuth, async function(req, res) {
    try{
        const orders = await listUserOrders(req.body, req.payload.user.id);
        sendOkResponse(res, orders, "User order list successfully created");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/details', userAuth, async function(req, res) {
    try{
        const order = await orderDetails(req.query, req.payload.user.id);
        sendOkResponse(res, order, "User order details successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/cancel/create', userAuth, async function(req, res) {
    try{
        const orderCancel = await createCancelOrderRequest(req.body, req.payload.user.id);
        sendCreatedResponse(res, orderCancel, "Order cancellation request sent")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/ready/pickup', userAuth, async function(req, res) {
    try{
        const order = await createUserReadyPickupOrder(req.body, req.payload.user.id);
        sendCreatedResponse(res, order, "Store is notified for the order")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/item/review/create', userAuth, async function(req, res) {
    try{
        const review = await createProductsReview(req.body, req.payload.user.id);
        sendCreatedResponse(res, review, "Order review successfully created");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})








router.post('/item/return/create', userAuth, async function(req, res) {
    try{
        const returnItems = await createReturnOrderItemsRequest(req.body, req.payload.user.id);
        sendCreatedResponse(res, returnItems, "Your return request has been placed. We'll get back to you shortly on this.");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/return/cancel', userAuth, async function(req, res) {
    try{
        const orderCancel = await cancelReturnOrderRequest(req.body, req.payload.user.id);
        sendOkResponse(res, orderCancel, "Return request cancelled successfully.");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






module.exports = { orderRouter: router }