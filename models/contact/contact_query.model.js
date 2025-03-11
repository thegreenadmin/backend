const { DataTypes, fn, col, Op } = require('sequelize');
const sequelize = global['sequelize'];

const ContactQuery = sequelize.define('contact_query', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    reply: {
        type: DataTypes.TEXT
    },

    is_reply_sent: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = ContactQuery;