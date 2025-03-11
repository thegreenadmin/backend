const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Store = require('../store/store.model');
const User = require('../user/user.model');
const Product = require('./product.model');
const QuantityType = require('./quantity_type.model');
const sequelize = global['sequelize'];

const FavouriteProduct = sequelize.define('favourite_product', {
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
            fields: ['product_id', 'user_id'],
            where: {status: 'active'}
        }
    ]
});


Product.hasMany(FavouriteProduct, { foreignKey: "product_id", target: "id" });
User.hasMany(FavouriteProduct, { foreignKey: "user_id", target: "id" });


FavouriteProduct.belongsTo(Product, { foreignKey: "product_id" });
FavouriteProduct.belongsTo(User, { foreignKey: "user_id" });


module.exports = FavouriteProduct;