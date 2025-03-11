const { DataTypes } = require('sequelize');
const User = require('../user/user.model');
const sequelize = global['sequelize'];

const NotificationSetting = sequelize.define('notification_setting', {
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

    notification_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['order', 'offer', 'message']
    },

    is_for_store: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
    }
},{
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'notification_type', 'is_for_store'],
            where: {
                status: 'active'
            }
        }
    ]
});



User.hasMany(NotificationSetting, { foreignKey: "user_id", target: "id" });
NotificationSetting.belongsTo(User, { foreignKey: "user_id" });

module.exports = NotificationSetting;