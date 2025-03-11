const {DataTypes, fn, col} = require('sequelize');
const sequelize = global['sequelize'];

const OrderStatus = sequelize.define('order_status', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    order_state_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_status_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    only_user_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },
    only_store_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
},
{
    indexes: [
        {
            unique: true,
            fields: [fn('lower', col('order_status_name'))],
            where: {status: 'active'}
        }
    ]
});


module.exports = OrderStatus;