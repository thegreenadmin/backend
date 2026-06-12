const { DataTypes } = require('sequelize');
const sequelize = global['sequelize'];

const Store = sequelize.define('stores', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    store_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        default: 0
    },

    tax_value: {
        type: DataTypes.DOUBLE,
        default: 12
    },

    dynamic_link: {
        type: DataTypes.TEXT
    },
    
    store_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    store_ein: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    image_url: {
        type: DataTypes.TEXT
    },

    logo_url: {
        type: DataTypes.TEXT
    },

    store_nick_name: {
        type: DataTypes.STRING(100),
    },

    store_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        }
    },

    store_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[0-9]{6,20}$/
        }
    },

    store_phone_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            is: /^\+\d{1,6}/
        }
    },

    is_verified: {
        type: DataTypes.BOOLEAN,
        default: true,
        allowNull: false
    },

    verified_by: {
        type: DataTypes.ENUM,
        values: ['admin', 'store_owner'],
        default: 'store_owner'
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        default: true,
        allowNull: false
    },

    // Business vertical of the store. 'herbs' stores may only be owned by the
    // licensed herbs provider of the store's country (country_herbs_licenses).
    store_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['general', 'munchies', 'herbs'],
        defaultValue: 'general'
    },

    
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = Store;