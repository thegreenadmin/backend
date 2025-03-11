const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderItem = require('../order/order_item.model');
const User = require('../user/user.model');
const Product = require('./product.model');
const sequelize = global['sequelize'];

const ProductVisitor = sequelize.define('product_visitor', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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


    user_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: User,
            key: 'id'
        }
    },

    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    address: {
        type: DataTypes.TEXT
    },

    city: {
        type: DataTypes.STRING
    },

    state: {
        type: DataTypes.STRING
    },

    country: {
        type: DataTypes.STRING
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Product.hasMany(ProductVisitor, { foreignKey: "product_id", target: "id" });
User.hasMany(ProductVisitor, { foreignKey: "user_id", target: "id" });



ProductVisitor.belongsTo(Product, { foreignKey: "product_id" });
ProductVisitor.belongsTo(User, { foreignKey: "user_id" });


module.exports = ProductVisitor;