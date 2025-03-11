const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const Product = require('../catalogue/product.model');
const Offer = require('./offer.model');
const sequelize = global['sequelize'];


const OfferProduct = sequelize.define('offer_product', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    offer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Offer,
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


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Offer.hasMany(OfferProduct, { foreignKey: "offer_id", target: "id" });
Product.hasMany(OfferProduct, { foreignKey: "product_id", target: "id" });


OfferProduct.belongsTo(Offer, { foreignKey: "offer_id" });
OfferProduct.belongsTo(Product, { foreignKey: "product_id" });

module.exports = OfferProduct;