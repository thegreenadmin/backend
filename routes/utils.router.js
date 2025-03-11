const express = require("express");
const { getDefaultTax } = require("../controllers/common.controller");
const { createContactQuery } = require("../controllers/contact.controller");
const { sendGCMPushNotification, sendFCMPushNotification } = require("../controllers/sns.controller");
const { listMembershipPlans } = require("../controllers/transaction.controller");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const { sendOkResponse, sendConflictResponse, sendCreatedResponse } = require("../utils/response.util");

const router = express.Router();


router.get('/countries', async function (req, res) {
    try{
        const __COUNTRIES = await Country.findAll({ 
            where: { status: 'active' },
            attributes: [
                ['id', 'country_id'],
                'country_name', 'abbrevation'
            ] 
        });


        const countries = []
        __COUNTRIES.forEach((c) => {
            if(c.country_name == "United States") {
                countries.push(c)
            }
        })

        __COUNTRIES.forEach((c) => {
            if(c.country_name == "Canada") {
                countries.push(c)
            }
        })

        __COUNTRIES.forEach((c) => {
            if(c.country_name != "United States") {
                countries.push(c)
            }
        })

        sendOkResponse(res, { countries }, "Countries successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/states', async function(req, res) {
    try{
        const country_id = req.query.country_id;
        const states = await State.findAll({
            where: {country_id, status: 'active'},
            attributes: [
                ['id', 'state_id'],
                'state_name'
            ]
        });
        sendOkResponse(res, {states}, "States successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/notification/send', async function(req, res) {
    try{
        const fmmNotificaiton = await sendFCMPushNotification(req.body.title, req.body.message, req.body.token);
        // const gcmNotification = await sendGCMPushNotification(req.body.title, req.body.message, req.body.token);
        sendOkResponse(res, {fmmNotificaiton}, "notification send")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/query/create', async function(req, res) {
    try{
        const contatQuery = await createContactQuery(req.body);
        sendCreatedResponse(res, contatQuery, "Message successfully send");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.get('/membership/plans', async function(req, res) {
    try{
        const plans = await listMembershipPlans();
        sendOkResponse(res, plans, "Plans successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/tax', async function(req, res) {
    try{
        const tax = await getDefaultTax();
        sendOkResponse(res, tax, "Tax successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





module.exports = { utilsRouter: router }