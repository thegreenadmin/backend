const { DataTypes } = require('sequelize');
const StoreStripeAccount = require('../store/store_stripe_account.model');
const PaymentService = require('./payment_service.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const StoreTransfer = sequelize.define('store_transfer', {
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

    store_stripe_account_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: StoreStripeAccount,
            key: 'id'
        }
    },

    service_charge_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount'],
        allowNull: false,
        default: 'amount'
    },

    service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_service_charged: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    transfered_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_transaction_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Transaction.hasMany(StoreTransfer, { foreignKey: "transaction_id", target: "id" });
StoreStripeAccount.hasMany(StoreTransfer, { foreignKey: "store_stripe_account_id", target: "id" });

StoreTransfer.belongsTo(Transaction, { foreignKey: "transaction_id" });
StoreTransfer.belongsTo(StoreStripeAccount, { foreignKey: "store_stripe_account_id" });


module.exports = StoreTransfer;