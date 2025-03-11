const { DataTypes, fn, col } = require('sequelize');
const sequelize = global['sequelize'];

const QuantityType = sequelize.define('quantity_type', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    
    quantity_type_name: {
        type: DataTypes.STRING(25),
        unique: true,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = QuantityType;