const { DataTypes, fn, col } = require('sequelize');
const sequelize = global['sequelize'];

const Country = sequelize.define('country', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    country_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    phone_code: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
    },
    abbrevation: {
        type: DataTypes.STRING(25)
    },
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = Country;