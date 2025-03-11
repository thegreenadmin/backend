const { DataTypes } = require('sequelize');
const PaymentService = require('./payment_service.model');
const sequelize = global['sequelize'];

const MembershipPlan = sequelize.define('membership_plan', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    plan_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    plan_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['store', 'product', 'combo']
    },

    plan_30_charge: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    plan_90_charge: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    plan_180_charge: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    plan_365_charge: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    plan_description: {
        type: DataTypes.TEXT
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});



module.exports = MembershipPlan;