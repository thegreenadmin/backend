const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const MessageHead = require('./message_head.model');
const sequelize = global['sequelize'];


const Message = sequelize.define('message', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    message_head_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: MessageHead,
            key: 'id'
        }
    },


    sender_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['user', 'store']
    },


    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    image_url : {
        type: DataTypes.TEXT
    },

    is_user_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },


    is_store_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },


    is_current_message: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: true
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});

MessageHead.hasMany(Message, { foreignKey: "message_head_id", target: "id" });
Message.belongsTo(MessageHead, { foreignKey: "message_head_id" });




module.exports = Message;