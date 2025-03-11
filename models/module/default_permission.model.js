const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Controller = require('../module/controller.model');
const Module = require('../module/module.model');
const DefaultRole = require('./default_role.model');
const sequelize = global['sequelize'];

const DefaultPermission = sequelize.define('default_permission', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    default_role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: DefaultRole,
            key: 'id'
        }
    },

    controller_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Controller,
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
            fields: ['default_role_id', 'controller_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});

DefaultRole.hasMany(DefaultPermission, { foreignKey: "default_role_id", target: "id" });
Controller.hasMany(DefaultPermission, { foreignKey: "controller_id", target: "id" });

DefaultPermission.belongsTo(DefaultRole, { foreignKey: "default_role_id" });
DefaultPermission.belongsTo(Controller, { foreignKey: "controller_id" })


module.exports = DefaultPermission;