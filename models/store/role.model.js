const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Module = require('../module/module.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];

const Role = sequelize.define('role', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    role_name: {
        type: DataTypes.STRING(25),
        allowNull: false
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
            fields: ['store_id', fn('lower', col('role_name'))],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});

Store.hasMany(Role, { foreignKey: "store_id", target: "id" });
Role.belongsTo(Store, { foreignKey: "store_id" });

module.exports = Role;