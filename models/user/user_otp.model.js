const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];
const User = require('./user.model');

const UserOTP = sequelize.define('user_otp', {
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

    otp: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },

    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


User.hasOne(UserOTP, { foreignKey: "user_id", target: "id" });
UserOTP.belongsTo(User, { foreignKey: "user_id" });

module.exports = UserOTP;