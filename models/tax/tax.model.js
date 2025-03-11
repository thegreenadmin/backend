const { DataTypes, fn, col, Op } = require('sequelize');
const sequelize = global['sequelize'];

const Tax = sequelize.define('tax', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    tax_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['amount', 'percentage']
    },
    tax_value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },

    stripe_enabled_tax: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = Tax;