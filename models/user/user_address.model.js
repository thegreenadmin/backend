const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const State = require('../state/state.model');
const sequelize = global['sequelize'];
const User = require('./user.model');

const UserAddress = sequelize.define('user_address', {
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
        type: DataTypes.STRING(10)
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


User.hasMany(UserAddress, { foreignKey: "user_id", target: "id" });
State.hasMany(UserAddress, { foreignKey: "state_id", target: "id" });

UserAddress.belongsTo(User, { foreignKey: "user_id" });
UserAddress.belongsTo(State, { foreignKey: "state_id" });


module.exports = UserAddress;