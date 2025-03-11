const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];

const Product = require('./product.model');
const Category = require('./category.model');

const ProductCategory = sequelize.define('product_category', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Category,
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
            fields: ['product_id', 'category_id'],
            where: {
                status: 'active'
            }
        }
    ]
});






Product.hasMany(ProductCategory, { foreignKey: "product_id", target: "id" });
Category.hasMany(ProductCategory, { foreignKey: "category_id", target: "id" });

ProductCategory.belongsTo(Product, { foreignKey: "product_id" });
ProductCategory.belongsTo(Category, { foreignKey: "category_id" });


module.exports = ProductCategory;