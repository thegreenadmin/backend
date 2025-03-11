const { Op } = require('sequelize');
const {DataTypes} = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];
const User = require('./user.model');
const UserAddress = require('./user_address.model');

const UserStripe = sequelize.define('user_stripe', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: User,
            key: 'id'
        }
    },

    user_address_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserAddress,
            key: 'id'
        }
    },

    stripe_customer_id: {
        type: DataTypes.STRING,
    },

    stripe_connected_account_id: {
        type: DataTypes.STRING,
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
            fields: ['user_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});


User.hasMany(UserStripe, {foreignKey: "user_id", target: "id"});
UserAddress.hasMany(UserStripe, {foreignKey: "user_address_id", target: "id"});

UserStripe.belongsTo(User, {foreignKey: "user_id"});
UserStripe.belongsTo(UserAddress, {foreignKey: "user_address_id"});


module.exports = UserStripe;