const {DataTypes} = require('sequelize');
const Product = require('../catalogue/product.model');
const Order = require('./order.model');
const sequelize = global['sequelize'];

const OrderItem = sequelize.define('order_item', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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


    product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Product,
            key: 'id'
        }
    },



    order_item_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    order_item_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    discount_name: {
        type: DataTypes.STRING
    },

    discount_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount']
    },

    discount_value: {
        type: DataTypes.DOUBLE
    },

    total_discount: {
        type: DataTypes.DOUBLE
    },

    order_item_status: {
        type: DataTypes.ENUM,
        values: ['received', 'in progress', 'completed', 'in transit', 'ready for pickup', 'cancelled', 'return request', 'return confirmed', 'return cancelled', 'returned'],
        default: 'received',
        allowNull: false
    },

    cancelledAt: {
        type: DataTypes.DATE
    },

    shippedAt: {
        type: DataTypes.DATE
    },

    deliveredAt: {
        type: DataTypes.DATE
    },

    returedAt: {
        type: DataTypes.DATE
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});




Order.hasMany(OrderItem, { foreignKey: "order_id", target: "id" });
Product.hasMany(OrderItem, { foreignKey: "product_id", target: "id" });


OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });




module.exports = OrderItem;