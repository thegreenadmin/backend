const { Op } = require('sequelize');
const {DataTypes} = require('sequelize');
const Store = require('../store/store.model');
const DeliveryService = require('./delivery_service.model');
const sequelize = global['sequelize'];

const StoreDeliveryService = sequelize.define('store_delivery_service', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    delivery_service_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: DeliveryService,
            key: 'id'
        }
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

    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false
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
            fields: ['delivery_service_id', 'store_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});


DeliveryService.hasMany(StoreDeliveryService, {foreignKey: "delivery_service_id", target: "id"});
Store.hasMany(StoreDeliveryService, {foreignKey: "store_id", target: "id"});

StoreDeliveryService.belongsTo(DeliveryService, {foreignKey: "delivery_service_id"});
StoreDeliveryService.belongsTo(Store, {foreignKey: "store_id"});


module.exports = StoreDeliveryService;