const { DataTypes } = require('sequelize');
const Store = require('./store.model');
const sequelize = global['sequelize'];

const StoreTiming = sequelize.define('store_timing', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    store_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Store,
            key: 'id'
        }
    },

    is_24_hours_active: {
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

    opening_time: {
        type: DataTypes.TIME
    },


    closing_time: {
        type: DataTypes.TIME
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
            fields: ['store_id', 'day_of_week'],
            where: {status: 'active'}
        }
    ]
});


Store.hasMany(StoreTiming, { foreignKey: "store_id", target: "id" });
Store.hasMany(StoreTiming, { foreignKey: "store_id", target: "id", as: 'all_store_timings' });
StoreTiming.belongsTo(Store, { foreignKey: "store_id" });


module.exports = StoreTiming;