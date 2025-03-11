const {DataTypes} = require('sequelize');
const sequelize = global['sequelize'];

const ReturnOrderItemStatus = sequelize.define('return_order_item_status', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },


    return_order_item_state_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    return_order_item_status_name: {
        type: DataTypes.STRING(25),
        allowNull: false
    },


    only_user_access : {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    only_store_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = ReturnOrderItemStatus;