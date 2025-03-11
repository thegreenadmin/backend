const { DataTypes } = require('sequelize');
const PaymentService = require('./payment_service.model');
const sequelize = global['sequelize'];

const Transaction = sequelize.define('transaction', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    payment_service_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: PaymentService,
            key: 'id'
        }
    },

    stripe_payment_intent_transaction_id: {
        type: DataTypes.STRING,
    },

    stripe_payout_transaction_id: {
        type: DataTypes.STRING
    },

    transaction_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['credit', 'refund', 'order', 'order cancel', 'item cancel', 'payout', 'payout refund', 'membership']
    },

    transaction_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


PaymentService.hasMany(Transaction, { foreignKey: "payment_service_id", target: "id" });
Transaction.belongsTo(PaymentService, { foreignKey: "payment_service_id" });

module.exports = Transaction;