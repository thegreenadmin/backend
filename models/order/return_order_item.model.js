const {DataTypes} = require('sequelize');
const Product = require('../catalogue/product.model');
const Order = require('./order.model');
const OrderItem = require('./order_item.model');
const sequelize = global['sequelize'];

const ReturnOrderItem = sequelize.define('return_order_item', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    order_item_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: OrderItem,
            key: 'id'
        }
    },


    return_items_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    remarks: {
        type: DataTypes.TEXT
    },

    total_amount_reversed: {
        type: DataTypes.DOUBLE,
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
            fields: ['order_item_id'],
            where: {
                status: 'active'
            }
        }
    ]
});




OrderItem.hasMany(ReturnOrderItem, { foreignKey: "order_item_id", target: "id" });
ReturnOrderItem.belongsTo(OrderItem, { foreignKey: "order_item_id" });



module.exports = ReturnOrderItem;