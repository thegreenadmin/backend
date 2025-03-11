const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const StoreUser = require('./store_users.model');
const sequelize = global['sequelize'];


const StoreUserTiming = sequelize.define('store_user_timing', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    store_user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: StoreUser,
            key: 'id'
        }
    },

    is_24_hrs_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },

    day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 7,
            isInt: true
        }
    },

    start_time: {
        type: DataTypes.TIME,
    },

    end_time: {
        type: DataTypes.TIME,
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
},{
    indexes: [
        {
            uniquie: true,
            fields : ['store_user_id', 'day_of_week'],
            where: {
                status: 'active'
            }
        }
    ]
});


StoreUser.hasMany(StoreUserTiming, { foreignKey: "store_user_id", target: "id" });
StoreUserTiming.belongsTo(StoreUser, { foreignKey: "store_user_id" });

module.exports = StoreUserTiming;