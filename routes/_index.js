const express = require("express");
const {adminRouter} = require("./admin.router");
const bodyParser = require('body-parser');
const {userRouter} = require("./user.router");
const { fileRouter } = require("./file.router");
const {storeRouter} = require("./store.router");
const {utilsRouter} = require("./utils.router");
const { shopRouter } = require("./shop.router");
const {orderRouter} = require("./order.router");
const { messageRouter } = require("./messages.router");
const { webhookRouter } = require("./webhook.router");
const { notificationRouter } = require("./notification.router");
const { pageRouter } = require("./page.router");
const LoggerRouter = require("./logger.router");

module.exports = function(app) {

    app.use('/api/v1/webhook', webhookRouter);
    app.use('/page', pageRouter);
    app.use('/web', LoggerRouter);
    const API_Router = express.Router();
    app.use("/api/v1", API_Router);

    API_Router.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    API_Router.use(bodyParser.json({limit: '50mb'}));

    API_Router.use('/admin', adminRouter);
    API_Router.use('/user', userRouter);
    API_Router.use('/store', storeRouter);
    API_Router.use('/utils', utilsRouter)
    API_Router.use('/shop', shopRouter);
    API_Router.use('/order', orderRouter);
    API_Router.use('/message', messageRouter);
    API_Router.use('/notification', notificationRouter);







    const FILE_Router = express.Router();
    app.use("/api/v1/file", FILE_Router);
    FILE_Router.use('', fileRouter);

}