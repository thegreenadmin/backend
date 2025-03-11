const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const User = require('../user/user.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];


const ClaimStore = sequelize.define('claim_store', {
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

    store_ein: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    claim_status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [ 'new', 'pending', 'accepted', 'rejected']
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
            fields: ['user_id', 'store_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});

User.hasMany(ClaimStore, { foreignKey: "user_id", target: "id" });
Store.hasMany(ClaimStore, { foreignKey: "store_id", target: "id" });

ClaimStore.belongsTo(User, { foreignKey: "user_id" });
ClaimStore.belongsTo(Store, { foreignKey: "store_id" })


module.exports = ClaimStore;