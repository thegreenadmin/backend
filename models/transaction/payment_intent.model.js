const { DataTypes } = require('sequelize');
const sequelize = global['sequelize'];
const User = require('../user/user.model');
const Store = require('../store/store.model');
const Transaction = require('./transaction.model');

/**
 * payment_intent
 * Backs the P2P / P2B scan-to-pay flow. One row per payment attempt, keyed by a
 * client-generated idempotency_key so create/confirm/retry are safe (spec 5.4.3).
 */
const PaymentIntent = sequelize.define('payment_intent', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    idempotency_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    initiator_user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: { min: 0, isInt: true },
        references: { model: User, key: 'id' }
    },

    payee_user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: User, key: 'id' }
    },

    payee_store_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: Store, key: 'id' }
    },

    type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['p2p', 'p2b']
    },

    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    fee: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },

    total: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD'
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['created', 'processing', 'succeeded', 'failed', 'cancelled', 'expired'],
        defaultValue: 'created'
    },

    biometric_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    // Session id from the scanned dynamic QR; unique-guarded for replay protection.
    qr_session_id: {
        type: DataTypes.STRING,
        allowNull: true
    },

    note: {
        type: DataTypes.STRING,
        allowNull: true
    },

    failure_reason: {
        type: DataTypes.STRING,
        allowNull: true
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: Transaction, key: 'id' }
    }
}, {
    indexes: [
        { unique: true, fields: ['idempotency_key'] },
        { fields: ['initiator_user_id'] },
        {
            unique: true,
            fields: ['qr_session_id'],
            where: { qr_session_id: { [require('sequelize').Op.ne]: null } }
        }
    ]
});

User.hasMany(PaymentIntent, { foreignKey: 'initiator_user_id', target: 'id' });
PaymentIntent.belongsTo(User, { foreignKey: 'initiator_user_id', as: 'initiator' });
PaymentIntent.belongsTo(User, { foreignKey: 'payee_user_id', as: 'payee_user' });
PaymentIntent.belongsTo(Store, { foreignKey: 'payee_store_id', as: 'payee_store' });
PaymentIntent.belongsTo(Transaction, { foreignKey: 'transaction_id' });

module.exports = PaymentIntent;
