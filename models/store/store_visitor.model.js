const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const { INVALID_STORE_USER_CREATING_CONSTRAINTS } = require('../../utils/messages.util');
const User = require('../user/user.model');
const Role = require('./role.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];


const StoreVisitor = sequelize.define('store_visitor', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: User,
            key: 'id'
        }
    },

    store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true
        },
        references: {
            model: Store,
            key: 'id'
        }
    },


    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    address: {
        type: DataTypes.TEXT
    },

    city: {
        type: DataTypes.STRING
    },

    state: {
        type: DataTypes.STRING
    },

    country: {
        type: DataTypes.STRING
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


User.hasMany(StoreVisitor, { foreignKey: "user_id", target: "id" });
Store.hasMany(StoreVisitor, { foreignKey: "store_id", target: "id" });


StoreVisitor.belongsTo(User, { foreignKey: "user_id" });
StoreVisitor.belongsTo(Store, { foreignKey: "store_id" });



module.exports = StoreVisitor;