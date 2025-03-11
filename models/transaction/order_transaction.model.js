const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const OrderTransaction = sequelize.define('order_transaction', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Transaction,
            key: 'id'
        }
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

    order_transaction_type: {
        type: DataTypes.ENUM,
        values: ['order', 'order cancel'],
        allowNull: false
    },

    store_service_charge_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount'],
        allowNull: false,
        default: 'amount'
    },

    store_service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    store_total_service_charged: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    order_service_charge_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount'],
        allowNull: false,
        default: 'amount'
    },

    order_service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    order_total_service_charged: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    store_received_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Transaction.hasMany(OrderTransaction, { foreignKey: "transaction_id", target: "id" });
Order.hasMany(OrderTransaction, { foreignKey: "order_id", target: "id" });

OrderTransaction.belongsTo(Transaction, { foreignKey: "transaction_id" });
OrderTransaction.belongsTo(Order, { foreignKey: "order_id" });


module.exports = OrderTransaction;