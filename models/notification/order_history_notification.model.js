const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderHistory = require('../order/order_history.model');
const sequelize = global['sequelize'];

const OrderNotification = sequelize.define('order_notification', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Order,
            key: 'id'
        }
    },

    is_sent: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    user_title: {
        type: DataTypes.STRING,
    },


    user_message: {
        type: DataTypes.TEXT,
    },

    store_title: {
        type: DataTypes.STRING,
    },


    store_message: {
        type: DataTypes.TEXT,
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
    }
});



Order.hasMany(OrderNotification, { foreignKey: "order_id", target: "id" });
OrderNotification.belongsTo(Order, { foreignKey: "order_id" });

module.exports = OrderNotification;