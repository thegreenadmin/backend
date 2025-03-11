const { DataTypes } = require('sequelize');
const State = require('../state/state.model');
const Admin = require('./admin.model');
const sequelize = global['sequelize'];

const AdminForgotPassword = sequelize.define('admin_forgot_password', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    admin_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Admin,
            key: 'id'
        }
    },

    key: {
        type: DataTypes.STRING,
        allowNull: false
    },

    expired_at: {
        type: DataTypes.DATE,
        allowNull: false
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});






Admin.hasMany(AdminForgotPassword, { foreignKey: "admin_id", target: "id" });

AdminForgotPassword.belongsTo(Admin, { foreignKey: "admin_id" });


module.exports = AdminForgotPassword;