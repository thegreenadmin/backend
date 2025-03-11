const {DataTypes} = require('sequelize');
const sequelize = global['sequelize'];

const OrderServiceCharge = sequelize.define('order_service_charge', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    service_charge_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['percentage', 'amount'],
        default: 'percentage'
    },
    service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = OrderServiceCharge;