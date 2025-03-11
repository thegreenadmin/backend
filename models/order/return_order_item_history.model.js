const {DataTypes} = require('sequelize');
const Product = require('../catalogue/product.model');
const ReturnOrderItem = require('./return_order_item.model');
const ReturnOrderItemStatus = require('./return_order_item_status.model');
const sequelize = global['sequelize'];

const ReturnOrderItemHistory = sequelize.define('return_order_item_history', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    return_order_item_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: ReturnOrderItem,
            key: 'id'
        }
    },


    return_order_item_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: ReturnOrderItemStatus,
            key: 'id'
        }
    },

    is_current_status: {
        type: DataTypes.BOOLEAN,
        default: true,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});




ReturnOrderItem.hasMany(ReturnOrderItemHistory, { foreignKey: "return_order_item_id", target: "id" });
ReturnOrderItemStatus.hasMany(ReturnOrderItemHistory, { foreignKey: "return_order_item_status_id", target: "id" });


ReturnOrderItemHistory.belongsTo(ReturnOrderItem, { foreignKey: "return_order_item_id" });
ReturnOrderItemHistory.belongsTo(ReturnOrderItemStatus, { foreignKey: "return_order_item_status_id" });




module.exports = ReturnOrderItemHistory;