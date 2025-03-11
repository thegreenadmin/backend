const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const { INVALID_STORE_USER_CREATING_CONSTRAINTS } = require('../../utils/messages.util');
const User = require('../user/user.model');
const Role = require('./role.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];


const StoreUser = sequelize.define('store_user', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true
        },
        references: {
            model: Store,
            key: 'id'
        }
    },

    role_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
            min: 0,
            isInt: true
        },
        references: {
            model: Role,
            key: 'id'
        }
    },


    description: {
        type: DataTypes.TEXT,
    },


    is_store_owner: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false,
    },

    is_verified: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    verification_code: {
        type: DataTypes.STRING(25),
    },

    verifiedAt: {
        type: DataTypes.DATE
    },

    verificationExpiredAt: {
        type: DataTypes.DATE,
        validate: {
            checkIsStoreOwnerOrNot(value) {
                if(!this.is_store_owner) {
                    if( (!value || !this.verification_code) && !this.verifiedAt) {
                        throw INVALID_STORE_USER_CREATING_CONSTRAINTS;
                    }
                }
            }
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
            fields: ['store_id', 'user_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});


User.hasMany(StoreUser, { foreignKey: "user_id", target: "id" });
Store.hasMany(StoreUser, { foreignKey: "store_id", target: "id" });
Role.hasMany(StoreUser, { foreignKey: "role_id", target: "id" });


StoreUser.belongsTo(User, { foreignKey: "user_id" });
StoreUser.belongsTo(Store, { foreignKey: "store_id" });
StoreUser.belongsTo(Role, { foreignKey: "role_id" });



module.exports = StoreUser;