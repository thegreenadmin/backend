const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderHistory = require('../order/order_history.model');
const User = require('../user/user.model');
const Store = require('../store/store.model');
const MessageHead = require('../message/message_head.model');
const Offer = require('../offer/offer.model');
const sequelize = global['sequelize'];

const Notification = sequelize.define('notification', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },


    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: User,
            key: 'id'
        }
    },

    store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Store,
            key: 'id'
        }
    },


    message_head_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: MessageHead,
            key: 'id'
        }
    },


    order_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Order,
            key: 'id'
        }
    },


    offer_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Offer,
            key: 'id'
        }
    },

    is_notification_for_store: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    is_sent: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
    },


    message: {
        type: DataTypes.TEXT,
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
    }
});



User.hasMany(Notification, { foreignKey: "user_id", target: "id" });
Store.hasMany(Notification, { foreignKey: "store_id", target: "id" });
MessageHead.hasMany(Notification, { foreignKey: "message_head_id", target: "id" });
Order.hasMany(Notification, { foreignKey: "order_id", target: "id" });
Offer.hasMany(Notification, { foreignKey: "offer_id", target: "id" });


Notification.belongsTo(User, { foreignKey: "user_id" });
Notification.belongsTo(Store, { foreignKey: "store_id" });
Notification.belongsTo(MessageHead, { foreignKey: "message_head_id" });
Notification.belongsTo(Order, { foreignKey: "order_id" });
Notification.belongsTo(Offer, { foreignKey: "offer_id" });


module.exports = Notification;