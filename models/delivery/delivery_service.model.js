const { DataTypes, fn, col, Op } = require('sequelize');
const sequelize = global['sequelize'];

const DeliveryService = sequelize.define('delivery_service', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    
    delivery_service_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
},{
    indexes: [
        {
            unique: true,
            fields: [fn('lower', col('delivery_service_name'))],
            where: {status: 'active'}
        }
    ]
});


module.exports = DeliveryService;