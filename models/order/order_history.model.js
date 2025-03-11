const {DataTypes, fn, col} = require('sequelize');
const Order = require('./order.model');
const OrderStatus = require('./order_status.model');
const sequelize = global['sequelize'];

const OrderHistory = sequelize.define('order_history', {
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
    order_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: OrderStatus,
            key: 'id'
        }
    },

    is_current_status: {
        type: DataTypes.BOOLEAN,
        default: true,
        allowNull: false
    },

    is_created_by_store: {
        type: DataTypes.BOOLEAN,
        default: true
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Order.hasMany(OrderHistory, { foreignKey: "order_id", target: "id" });
OrderStatus.hasMany(OrderHistory, { foreignKey: "order_status_id", target: "id" });

OrderHistory.belongsTo(Order, { foreignKey: "order_id" });
OrderHistory.belongsTo(OrderStatus, { foreignKey: "order_status_id" });



module.exports = OrderHistory;