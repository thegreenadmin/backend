const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Module = require('./module.model');
const sequelize = global['sequelize'];

const logger = require('../../logger/logger');

const Controller = sequelize.define('controller', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    module_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Module,
            key: 'id'
        }
    },

    controller_key: {
        type: DataTypes.STRING(35),
        allowNull: false,
        unique: true
    },

    controller_name: {
        type: DataTypes.STRING(35),
        allowNull: false,
    },

    controller_description: {
        type: DataTypes.STRING,
        allowNull: false
    },


    only_store_owner_accessible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
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
            fields: ['module_id', fn('lower', col('controller_key'))],
            where: {
                status: {
                    [Op.eq]: 'active'
                }
            }
        }
    ]
});

Module.hasMany(Controller, { foreignKey: "module_id", target: "id" });
Controller.belongsTo(Module, { foreignKey: "module_id" });


module.exports = Controller;