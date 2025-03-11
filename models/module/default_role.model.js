const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Module = require('../module/module.model');
const sequelize = global['sequelize'];

const DefaultRole = sequelize.define('default_role', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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
});

module.exports = DefaultRole;