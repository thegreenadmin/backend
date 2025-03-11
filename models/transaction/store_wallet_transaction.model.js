const { DataTypes } = require('sequelize');
const Store = require('../store/store.model');
const UserStripeCard = require('../user/user_stripe_card.model');
const Membership = require('./membership.model');
const OrderItemRefundTransaction = require('./order_item_refund_transaction.model');
const OrderTransaction = require('./order_transaction.model');
const PaymentService = require('./payment_service.model');
const StorePayout = require('./store_payout.model');
const StoreTransfer = require('./store_transfer.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const StoreWalletTransaction = sequelize.define('store_wallet_transaction', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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


    order_transaction_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: OrderTransaction,
            key: 'id'
        }
    },

    order_item_refund_transaction_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: OrderItemRefundTransaction,
            key: 'id'
        }
    },

    store_payout_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: StorePayout,
            key: 'id'
        }
    },

    transaction_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Transaction,
            key: 'id'
        }
    },

    membership_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Membership,
            key: 'id'
        }
    },

    user_stripe_card_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserStripeCard,
            key: 'id'
        }
    },

    net_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Store.hasMany(StoreWalletTransaction, { foreignKey: "store_id", target: "id" });
OrderTransaction.hasMany(StoreWalletTransaction, { foreignKey: "order_transaction_id", target: "id" });
OrderItemRefundTransaction.hasMany(StoreWalletTransaction, { foreignKey: "order_item_refund_transaction_id", target: "id" });
StorePayout.hasMany(StoreWalletTransaction, { foreignKey: "store_payout_id", target: "id" });
Transaction.hasMany(StoreWalletTransaction, { foreignKey: "transaction_id", target: "id" });
Membership.hasMany(StoreWalletTransaction, { foreignKey: "membership_id", target: "id" });
UserStripeCard.hasMany(StoreWalletTransaction, { foreignKey: "user_stripe_card_id", target: "id" });

StoreWalletTransaction.belongsTo(Store, { foreignKey: "store_id" });
StoreWalletTransaction.belongsTo(OrderTransaction, { foreignKey: "order_transaction_id" });
StoreWalletTransaction.belongsTo(OrderItemRefundTransaction, { foreignKey: "order_item_refund_transaction_id" });
StoreWalletTransaction.belongsTo(StorePayout, { foreignKey: "store_payout_id" });
StoreWalletTransaction.belongsTo(Transaction, { foreignKey: "transaction_id" });
StoreWalletTransaction.belongsTo(Membership, { foreignKey: "membership_id" });
StoreWalletTransaction.belongsTo(UserStripeCard, { foreignKey: "user_stripe_card_id" });


module.exports = StoreWalletTransaction;