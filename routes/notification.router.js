const express = require("express");
const { userAuth } = require("../controllers/auth.controller");
const { listNotificationSettings, saveNotificationSetting, listNotifications } = require("../controllers/notification.controller");
const { sendConflictResponse, sendOkResponse } = require("../utils/response.util");
const router = express.Router();





router.get('/setting/list', userAuth, async function(req, res) {
    try{
        const notificationSettings = await listNotificationSettings(req.query, req.payload.user.id);
        sendOkResponse(res, notificationSettings, "Notification setting list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.post('/setting/save', userAuth, async function(req, res) {
    try{
        const setting = await saveNotificationSetting(req.body, req.payload.user.id);
        sendOkResponse(res, setting, "Notification preference updated");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.get('/list', userAuth, async function(req, res) {
    try{
        const notifications = await listNotifications(req.query, req.payload.user.id);
        sendOkResponse(res, notifications, "Notification list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




















module.exports = {notificationRouter: router}