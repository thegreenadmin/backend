const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Role = require('./role.model');
const StoreUser = require('./store_users.model');
const sequelize = global['sequelize'];


const StoreUserRole = sequelize.define('store_user_role', {
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

    store_user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true
        },
        references: {
            model: StoreUser,
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
            fields: ['role_id', 'store_user_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});


Role.hasOne(StoreUserRole, { foreignKey: "role_id", target: "id" });
StoreUser.hasOne(StoreUserRole, { foreignKey: "store_user_id", target: "id" });

StoreUserRole.belongsTo(Role, { foreignKey: "role_id" });
StoreUserRole.belongsTo(StoreUser, { foreignKey: "store_user_id" });


module.exports = StoreUserRole;