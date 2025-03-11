const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const User = require('./user.model');
const sequelize = global['sequelize'];

const UserSession = sequelize.define('user_session', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    device_id: {
        type: DataTypes.STRING,
        allowNull: false
    },


    device_type: {
        type: DataTypes.ENUM,
        values: ['GCM', 'APNS'],
        allowNull: false
    },

    device_token: {
        type: DataTypes.TEXT,
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

//create relations
User.hasMany(UserSession, { foreignKey: "user_id", target: "id" });
UserSession.belongsTo(User, { foreignKey: "user_id" });


module.exports = UserSession;