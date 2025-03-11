const {DataTypes, Op, fn, col} = require('sequelize');
const Product = require('../catalogue/product.model');
const User = require('../user/user.model');
const sequelize = global['sequelize'];

const CartItem = sequelize.define('cart_item', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    items_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        }
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
            fields: ['user_id', 'product_id'],
            where: {
                status: {
                    [Op.eq] : 'active',
                },
            }
        },
    ]
});



User.hasMany(CartItem, { foreignKey: "user_id", target: "id" });
Product.hasMany(CartItem, { foreignKey: "product_id", target: "id" });

CartItem.belongsTo(User, { foreignKey: "user_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

module.exports = CartItem;