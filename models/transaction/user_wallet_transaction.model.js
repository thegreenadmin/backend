const { DataTypes } = require('sequelize');
const User = require('../user/user.model');
const UserStripeCard = require('../user/user_stripe_card.model');
const Membership = require('./membership.model');
const OrderItemRefundTransaction = require('./order_item_refund_transaction.model');
const OrderTransaction = require('./order_transaction.model');
const PaymentService = require('./payment_service.model');
const Transaction = require('./transaction.model');
const UserWalletAutoCharge = require('./user_wallet_auto_charge.model');
const sequelize = global['sequelize'];

const UserWalletTransactions = sequelize.define('user_wallet_transaction', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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

    order_transcation_id: {
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

    user_wallet_auto_charge_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserWalletAutoCharge,
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


User.hasMany(UserWalletTransactions, { foreignKey: "user_id", target: "id" });
OrderTransaction.hasMany(UserWalletTransactions, { foreignKey: "order_transcation_id", target: "id" });
OrderItemRefundTransaction.hasMany(UserWalletTransactions, { foreignKey: "order_item_refund_transaction_id", target: "id" });
Transaction.hasMany(UserWalletTransactions, { foreignKey: "transaction_id", target: "id" });
UserStripeCard.hasMany(UserWalletTransactions, { foreignKey: "user_stripe_card_id", target: "id" });
UserWalletAutoCharge.hasMany(UserWalletTransactions, { foreignKey: "user_wallet_auto_charge_id", target: "id" });



UserWalletTransactions.belongsTo(User, { foreignKey: "user_id" });
UserWalletTransactions.belongsTo(Transaction, { foreignKey: "transaction_id" });
UserWalletTransactions.belongsTo(OrderTransaction, { foreignKey: "order_transcation_id" });
UserWalletTransactions.belongsTo(OrderItemRefundTransaction, { foreignKey: "order_item_refund_transaction_id" });
UserWalletTransactions.belongsTo(UserStripeCard, { foreignKey: "user_stripe_card_id" });
UserWalletTransactions.belongsTo(UserWalletAutoCharge, { foreignKey: "user_wallet_auto_charge_id" });




module.exports = UserWalletTransactions;