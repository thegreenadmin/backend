const express = require("express");
const { getDefaultTax } = require("../controllers/common.controller");
const { createContactQuery } = require("../controllers/contact.controller");
const { sendGCMPushNotification, sendFCMPushNotification } = require("../controllers/sns.controller");
const { listMembershipPlans } = require("../controllers/transaction.controller");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const { sendOkResponse, sendConflictResponse, sendCreatedResponse } = require("../utils/response.util");
const { hasUserAuth } = require("../controllers/auth.controller");
const {
    resolveCallerCountry,
    getCountryFeatures,
    getHerbsLicensee,
} = require("../controllers/feature.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/utils/app/config:
 *   get:
 *     summary: Resolved app configuration for the caller
 *     description: >
 *       Per-country feature availability (munchies/herbs/payments) resolved
 *       from call metadata (X-Device-Country header, then IP geolocation,
 *       then account phone code). Works for guests; with a bearer token it
 *       also reports whether the caller is the herbs licensee.
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: App config successfully fetched
 */
router.get('/app/config', hasUserAuth, resolveCallerCountry, async function (req, res) {
    try {
        const country = req.callerCountry;
        const features = await getCountryFeatures(country ? country.id : null);

        let isHerbsLicensee = false;
        const userId = req.payload?.user?.id;
        if (userId && country) {
            const license = await getHerbsLicensee(country.id);
            isHerbsLicensee = !!license && Number(license.user_id) === Number(userId);
        }

        sendOkResponse(res, {
            version: 1,
            country: country ? {
                country_id: country.id,
                country_name: country.country_name,
                abbrevation: country.abbrevation,
            } : null,
            features,
            is_herbs_licensee: isHerbsLicensee,
        }, "App config successfully fetched");
    } catch (err) {
        sendConflictResponse(res, {}, err);
    }
});


/**
 * @swagger
 * /api/v1/utils/countries:
 *   get:
 *     summary: List countries
 *     description: Get list of countries (prioritizes US and Canada)
 *     tags: [Utils]
 *     responses:
 *       200:
 *         description: Countries successfully fetched
 */
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



/**
 * @swagger
 * /api/v1/utils/states:
 *   get:
 *     summary: List states
 *     description: Get list of states for a specific country
 *     tags: [Utils]
 *     parameters:
 *       - in: query
 *         name: country_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: States successfully fetched
 */
router.get('/states', async function(req, res){
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



/**
 * @swagger
 * /api/v1/utils/notification/send:
 *   post:
 *     summary: Send push notification
 *     description: Send FCM push notification to a device
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - token
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/notification/send', async function(req, res){
    try{
        const fmmNotificaiton = await sendFCMPushNotification(req.body.title, req.body.message, req.body.token);
        // const gcmNotification = await sendGCMPushNotification(req.body.title, req.body.message, req.body.token);
        sendOkResponse(res, {fmmNotificaiton}, "notification send")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



/**
 * @swagger
 * /api/v1/utils/query/create:
 *   post:
 *     summary: Create contact query
 *     description: Submit a contact query to support
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact query successfully created
 */
router.post('/query/create', async function(req, res){
    try{
        const contactQuery = await createContactQuery(req.body);
        sendCreatedResponse(res, contactQuery, "Contact query successfully created")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




/**
 * @swagger
 * /api/v1/utils/membership/plans:
 *   get:
 *     summary: List membership plans
 *     description: Get list of available membership plans
 *     tags: [Utils]
 *     responses:
 *       200:
 *         description: Plans successfully fetched
 */
router.get('/membership/plans', async function(req, res) {
    try{
        const plans = await listMembershipPlans();
        sendOkResponse(res, plans, "Plans successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




/**
 * @swagger
 * /api/v1/utils/tax:
 *   get:
 *     summary: Get default tax rate
 *     description: Get the default tax rate for the platform
 *     tags: [Utils]
 *     responses:
 *       200:
 *         description: Tax successfully fetched
 */
router.get('/tax', async function(req, res){
    try{
        const tax = await getDefaultTax();
        sendOkResponse(res, tax, "Tax successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





module.exports = { utilsRouter: router }