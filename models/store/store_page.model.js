const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const Store = require('./store.model');
const StoreUser = require('./store_users.model');
const sequelize = global['sequelize'];


const StorePage = sequelize.define('store_page', {
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

    store_page_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['terms', 'privacy']
    },

    store_page_content: {
        type: DataTypes.TEXT
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Store.hasMany(StorePage, { foreignKey: "store_id", target: "id" });
StorePage.belongsTo(Store, { foreignKey: "store_id" });

module.exports = StorePage;