const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];

const Product = require('./product.model');

const ProductLink = sequelize.define('product_link', {
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

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    link: {
        type: DataTypes.TEXT,
        allowNull: false
    },  

    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },



    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});






Product.hasMany(ProductLink, { foreignKey: "product_id", target: "id" });
ProductLink.belongsTo(Product, { foreignKey: "product_id" });


module.exports = ProductLink;