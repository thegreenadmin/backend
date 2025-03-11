const { DataTypes } = require('sequelize');
const StoreStripeAccount = require('./store_stripe_account.model');
const sequelize = global['sequelize'];

const StoreStripeBankAccount = sequelize.define('store_stripe_bank_account', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    stripe_bank_account_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});

StoreStripeAccount.hasMany(StoreStripeBankAccount, { foreignKey: "store_stripe_account_id", target: "id" });
StoreStripeBankAccount.belongsTo(StoreStripeAccount, { foreignKey: "store_stripe_account_id" });

module.exports = StoreStripeBankAccount;