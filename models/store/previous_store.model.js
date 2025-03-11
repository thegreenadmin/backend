const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');

const User = require('../user/user.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];


const PreviousStore = sequelize.define('previous_store', {
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


    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 1
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


User.hasMany(PreviousStore, { foreignKey: "user_id", target: "id" });
Store.hasMany(PreviousStore, { foreignKey: "store_id", target: "id" });

PreviousStore.belongsTo(User, { foreignKey: "user_id" });
PreviousStore.belongsTo(Store, { foreignKey: "store_id" });


module.exports = PreviousStore;