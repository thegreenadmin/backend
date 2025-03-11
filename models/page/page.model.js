const { Op } = require('sequelize');
const {DataTypes} = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const PageType = require('./page_type.model');
const sequelize = global['sequelize'];

const Page = sequelize.define('page', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },

    page_title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    page_content: {
        type: DataTypes.TEXT
    },

    is_system_page: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
},{
    indexes: [
        {
            unique: true,
            fields: ['slug'],
            where: {status: 'active'}
        }
    ]
});


module.exports = Page;