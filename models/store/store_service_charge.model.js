const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const StoreUser = require('./store_users.model');
const Store = require('./store.model');
const sequelize = global['sequelize'];


const StoreServiceCharge = sequelize.define('store_service_charge', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    store_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
            async checkIfNewInsertedValueIsNull() {
                if(this.store_id == null) {
                    const isNullExists = await StoreServiceCharge.findOne({where: {store_id: null}, status: 'active'});
                    if(isNullExists) {
                        throw "Default service charge already exists"
                    }
                }
            }
        },
        references: {
            model: Store,
            key: 'id'
        }
    },

    service_charge_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount'],
        allowNull: false,
        default: 'amount'
    },

    service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
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
            fields : ['store_id'],
            where: {
                status: 'active'
            }
        }
    ]
});


Store.hasMany(StoreServiceCharge, { foreignKey: "store_id", target: "id" });
StoreServiceCharge.belongsTo(Store, { foreignKey: "store_id" });

module.exports = StoreServiceCharge;