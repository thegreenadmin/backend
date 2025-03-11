const {DataTypes} = require('sequelize');
const sequelize = global['sequelize'];

const PageType = sequelize.define('page_type', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    page_type_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


module.exports = PageType;