const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Controller = require('../module/controller.model');
const Module = require('../module/module.model');
const Role = require('./role.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];

const Permission = sequelize.define('permission', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Role,
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
            fields: ['role_id', 'controller_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});

Role.hasMany(Permission, { foreignKey: "role_id", target: "id" });
Controller.hasMany(Permission, { foreignKey: "controller_id", target: "id" });

Permission.belongsTo(Role, { foreignKey: "role_id" });
Permission.belongsTo(Controller, { foreignKey: "controller_id" })


module.exports = Permission;