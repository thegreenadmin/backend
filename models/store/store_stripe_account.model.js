const { DataTypes } = require('sequelize');
const Store = require('./store.model');
const sequelize = global['sequelize'];

const StoreStripeAccount = sequelize.define('store_stripe_account', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    stripe_account_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});

Store.hasMany(StoreStripeAccount, { foreignKey: "store_id", target: "id" });
StoreStripeAccount.belongsTo(Store, { foreignKey: "store_id" });

module.exports = StoreStripeAccount;