const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = global['sequelize'];

const Module = sequelize.define('module', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    module_key: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true,
    },

    module_name: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true,
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
    }
},
{
    indexes: [
        {
            unique: true,
            fields: [fn('lower', col('module_name'))],
            where: {
                status: {
                    [Op.eq] : "active"
                }
            }
        }
    ]
});


module.exports = Module;