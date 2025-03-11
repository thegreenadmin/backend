const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const State = require('../state/state.model');
const Order = require('./order.model');
const sequelize = global['sequelize'];

const OrderDeliveryAddress = sequelize.define('order_delivery_address', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Order,
            key: 'id'
        }
    },

    state_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: State,
            key: 'id'
        }
    },

    address_line_1: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    address_line_2: {
        type: DataTypes.STRING(100),
    },

    landmark: {
        type: DataTypes.STRING(100),
    },

    city: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    postal_code: {
        type: DataTypes.STRING(10)
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Order.hasMany(OrderDeliveryAddress, { foreignKey: "order_id", target: "id" });
State.hasMany(OrderDeliveryAddress, { foreignKey: "state_id", target: "id" });

OrderDeliveryAddress.belongsTo(Order, { foreignKey: "order_id" });
OrderDeliveryAddress.belongsTo(State, { foreignKey: "state_id" });


module.exports = OrderDeliveryAddress;