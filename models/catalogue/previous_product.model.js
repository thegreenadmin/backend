const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderItem = require('../order/order_item.model');
const User = require('../user/user.model');
const Product = require('./product.model');
const sequelize = global['sequelize'];

const PreviousProduct = sequelize.define('previous_product', {
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
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: User,
            key: 'id'
        }
    },

    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 1
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Product.hasMany(PreviousProduct, { foreignKey: "product_id", target: "id" });
User.hasMany(PreviousProduct, { foreignKey: "user_id", target: "id" });



PreviousProduct.belongsTo(Product, { foreignKey: "product_id" });
PreviousProduct.belongsTo(User, { foreignKey: "user_id" });


module.exports = PreviousProduct;