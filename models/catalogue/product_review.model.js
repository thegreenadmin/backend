const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderItem = require('../order/order_item.model');
const User = require('../user/user.model');
const Product = require('./product.model');
const sequelize = global['sequelize'];

const ProductReview = sequelize.define('product_review', {
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


    rating: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 5,
            isInt: true
        }
    },


    review: {
        type: DataTypes.TEXT
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
            fields: ['product_id', 'user_id', 'order_id'],
            where: {status: 'active'}
        }
    ]
});


Product.hasMany(ProductReview, { foreignKey: "product_id", target: "id" });
User.hasMany(ProductReview, { foreignKey: "user_id", target: "id" });
Order.hasMany(ProductReview, { foreignKey: "order_id", target: "id" });



ProductReview.belongsTo(Product, { foreignKey: "product_id" });
ProductReview.belongsTo(User, { foreignKey: "user_id" });
ProductReview.belongsTo(Order, { foreignKey: "order_id" });


module.exports = ProductReview;