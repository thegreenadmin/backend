const { Op } = require('sequelize');
const {DataTypes} = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];
const User = require('./user.model');

const BlockUser = sequelize.define('block_user', {
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


User.hasMany(BlockUser, {foreignKey: "user_id", target: "id"});
BlockUser.belongsTo(User, {foreignKey: "user_id"});


module.exports = BlockUser;