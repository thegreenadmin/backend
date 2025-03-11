const { Op } = require("sequelize");
const ContactQuery = require("../models/contact/contact_query.model");
const AdminNotification = require("../models/notification/admin_notification.model");
const Notification = require("../models/notification/notification.model");
const NotificationSetting = require("../models/notification/notification_setting.model");
const Order = require("../models/order/order.model");
const ClaimStore = require("../models/store/claim_store.model");
const Store = require("../models/store/store.model");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");
const listNotificationSettings = async function(data, user_id) {
    // data = {is_for_store}
    try{
        const {is_for_store} = data;
        const __NOTIFICATION_SETTINGS = await NotificationSetting.findAll({
            where: {
                user_id, 
                is_for_store,
                status: 'active'
            },
            attributes: {
                include: [['id', 'notificaiton_setting_id']],
                exclude: ['id']
            }
        })

        return {notification_settings: __NOTIFICATION_SETTINGS};
    }catch(err) {
        throw err;
    }
}
const saveNotificationSetting = async function(data, user_id) {
    // data = {notification_type, is_for_store, is_enabled}
    try{
        const {notification_type, is_for_store, is_enabled} = data;
        const __IS_SETTING_AVAILABLE = await NotificationSetting.findOne({
            where: {user_id, notification_type, is_for_store, status: 'active'}
        })

        if(__IS_SETTING_AVAILABLE) {
            await NotificationSetting.update({
                notification_type, is_for_store, is_enabled
            },{
                where: {id: __IS_SETTING_AVAILABLE.id, status: 'active'}
            })
        }else {
            await NotificationSetting.create({
                user_id, notification_type, is_for_store, is_enabled, status: 'active'
            })
        }

        return {is_updated: true}

    }catch(err) {
        throw err;
    }
}

const listNotifications = async function(data, user_id) {
    // data = {is_notification_for_store, page, page_size}
    try{
        const {is_notification_for_store, page, page_size} = data;

        const order = [['id', 'DESC']];

        const query = {
            where: {is_notification_for_store, user_id, status: 'active'},
            attributes: {
                include: [['id', 'notification_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: Store,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                }
            ]
        }

        const __NOTIFICATIONS = await CommonController.getPaginationResult({
            Model: Notification, query, page, page_size, order, as: 'data'
        })

        const notifications = __NOTIFICATIONS.data.map(notification => {
            notification = notification.toJSON();
            notification.store.logo = S3Controller.getAwsS3SignedFileUrl(notification.store.logo_url)
            notification.store.image = S3Controller.getAwsS3SignedFileUrl(notification.store.image_url)
            delete notification.store.logo_url;
            delete notification.store.image_url;
            return notification;
        })

        await Notification.update({
            is_read: true, is_sent: true
        },{
            where: {id: {[Op.in]: notifications.map(n => n.notification_id)}}
        })

        return {total_count: __NOTIFICATIONS.total_count, notifications}
    }catch(err) {
        throw err;
    }
}
//admin
//admin
//admin
//admin
//admin
//admin
const admin_listNotifications = async function(data) {
    // data = {page, page_size, order_by, order_type}
    try{
        const {page, page_size, order_by, order_type} = data;

        const order = order_by && order_type ? [[(order_by == 'admin_notification_id' ? 'id' : order_by), order_type]] : [['id', 'DESC']];

        const query = {
            where: {status: 'active'},
            attributes: {
                include: [['id', 'admin_notification_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: Store,
                    required: false,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: Order,
                    required: false,
                    attributes: {
                        include: [['id', 'order']],
                        exclude: ['id']
                    }
                },
                {
                    model: ClaimStore,
                    required: false,
                    attributes: {
                        include: [['id', 'claim_store_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: ContactQuery,
                    required: false,
                    attributes: {
                        include: [['id', 'contact_query_id']],
                        exclude: ['id']
                    }
                }
            ]
        }

        const __ADMIN_NOTIFICATIONS = await CommonController.getPaginationResult({
            Model: AdminNotification, page, page_size, order, query, as: 'admin_notifications'
        })

        await AdminNotification.update({is_read: true}, {where: {status: 'active', is_read: false}})

        return __ADMIN_NOTIFICATIONS;
    }catch(err) {
        throw err;
    }
}

const admin_unreadNotificationCount = async function() {
    try{
        const unread_count = await AdminNotification.count({
            where: {is_read: false, status: 'active'}
        })

        return {unread_count};
    }catch(err) {
        throw err;
    }
}
module.exports = {
    listNotificationSettings, saveNotificationSetting, listNotifications, 

    admin_listNotifications, admin_unreadNotificationCount,
}