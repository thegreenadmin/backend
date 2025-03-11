const { DataTypes } = require('sequelize');
const OrderItem = require('../order/order_item.model');
const ReturnOrderItem = require('../order/return_order_item.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const OrderItemRefundTransaction = sequelize.define('order_item_refund_transaction', {
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

    order_item_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: OrderItem,
            key: 'id'
        }
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Transaction.hasMany(OrderItemRefundTransaction, { foreignKey: "transaction_id", target: "id" });
OrderItem.hasMany(OrderItemRefundTransaction, { foreignKey: "order_item_id", target: "id" });

OrderItemRefundTransaction.belongsTo(Transaction, { foreignKey: "transaction_id" });
OrderItemRefundTransaction.belongsTo(OrderItem, { foreignKey: "order_item_id" });


module.exports = OrderItemRefundTransaction;