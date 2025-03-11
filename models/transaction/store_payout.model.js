const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderItem = require('../order/order_item.model');
const Store = require('../store/store.model');
const StoreStripeBankAccount = require('../store/store_stripe_bank_account.model');
const UserStripeBank = require('../user/user_stripe_bank.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const StorePayout = sequelize.define('store_payout', {
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

    user_stripe_bank_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserStripeBank,
            key: 'id'
        }
    },

    transfered_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_transaction_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    reversed_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_reversed_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    payout_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['transfered', 'reversed']
    },

    is_reversed: {
        type: DataTypes.BOOLEAN
    },

    stripe_transfer_id: {
        type: DataTypes.STRING
    },

    stripe_payout_id: {
        type: DataTypes.STRING
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Transaction.hasMany(StorePayout, { foreignKey: "transaction_id", target: "id" });
UserStripeBank.hasMany(StorePayout, { foreignKey: "user_stripe_bank_id", target: "id" });


StorePayout.belongsTo(Transaction, { foreignKey: "transaction_id" });
StorePayout.belongsTo(UserStripeBank, { foreignKey: "user_stripe_bank_id" });



module.exports = StorePayout;