const { DataTypes } = require('sequelize');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const TransactionHistory = sequelize.define('transaction_history', {
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

    transaction_status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['success', 'failed', 'pending']
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Transaction.hasMany(TransactionHistory, { foreignKey: "transaction_id", target: "id" });
TransactionHistory.belongsTo(Transaction, { foreignKey: "transaction_id" });

module.exports = TransactionHistory;