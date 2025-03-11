const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Store = require('../store/store.model');
const QuantityType = require('./quantity_type.model');
const sequelize = global['sequelize'];

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Store,
            key: 'id'
        }
    },


    quantity_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: QuantityType,
            key: 'id'
        }
    },


    quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },


    is_featured_product: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },


    product_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT
    },

    product_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    selling_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    discount_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount']
    },

    discount_value: {
        type: DataTypes.DOUBLE,
    },

    is_product_returnable: {
        type: DataTypes.BOOLEAN,
        default: false
    },

    return_days_count: {
        type: DataTypes.INTEGER
    },

    length: {
        type: DataTypes.DOUBLE
    },

    width: {
        type: DataTypes.DOUBLE
    },

    height: {
        type: DataTypes.DOUBLE
    },

    weight: {
        type: DataTypes.DOUBLE
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Store.hasMany(Product, { foreignKey: "store_id", target: "id" });
QuantityType.hasMany(Product, { foreignKey: "quantity_type_id", target: "id" });


Product.belongsTo(Store, { foreignKey: "store_id" });
Product.belongsTo(QuantityType, { foreignKey: "quantity_type_id" });


module.exports = Product;