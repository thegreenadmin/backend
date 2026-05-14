const express = require("express");
const { stripeWebHook } = require("../controllers/stripe.controller");
const logger = require("../logger/logger");
const { sendConflictResponse, sendOkResponse } = require("../utils/response.util");
const router = express.Router();




router.post('/stripe', express.raw({type: 'application/json'}), async function(req, res) {
    try{
        const sig = req.headers['stripe-signature'];
        const stripeHook = await stripeWebHook(req.body.toString('utf8'), sig);
        sendOkResponse(res, stripeHook, "Webhook data successfully completed");
    }catch(err) {   
        sendConflictResponse(res, {}, err);
    }
})


  






module.exports = {webhookRouter: router}