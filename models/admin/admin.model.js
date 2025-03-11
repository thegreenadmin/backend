const {DataTypes} = require('sequelize');
const sequelize = global['sequelize'];

const Admin = sequelize.define('admin', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image_url: {
        type: DataTypes.TEXT
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
            fields: [ 'email'],
            where: {
                status: 'active',
            }
        }
    ]
});


module.exports = Admin;