const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const State = require('../state/state.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];

const StoreAddress = sequelize.define('store_address', {
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

    state_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: State,
            key: 'id'
        }
    },

    address_name: {
        type: DataTypes.STRING(25),
        default: 'Home'
    },

    longitude: {
        type: DataTypes.DOUBLE
    },

    latitude: {
        type: DataTypes.DOUBLE
    },

    address_line_1: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    address_line_2: {
        type: DataTypes.STRING(100),
    },

    landmark: {
        type: DataTypes.STRING(100),
    },

    city: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    postal_code: {
        type: DataTypes.STRING(255)
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Store.hasMany(StoreAddress, { foreignKey: "store_id", target: "id" });
State.hasMany(StoreAddress, { foreignKey: "state_id", target: "id" });

StoreAddress.belongsTo(Store, { foreignKey: "store_id" });
StoreAddress.belongsTo(State, { foreignKey: "state_id" });


module.exports = StoreAddress;