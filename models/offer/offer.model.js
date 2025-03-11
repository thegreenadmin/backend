const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const Store = require('../store/store.model');
const sequelize = global['sequelize'];


const Offer = sequelize.define('offer', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    auto_created: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },


    is_offer_for_store: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },


    offer_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    image_url: {
        type: DataTypes.TEXT,
    },


    offer_type: {
        type: DataTypes.ENUM,
        values: ['percentage', 'amount'],
        allowNull: false,
        default: 'amount'
    },


    offer_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },


    is_expired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },


    expiredAt: {
        type: DataTypes.DATE,
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
            fields: ['store_id', 'is_offer_for_store'],
            where: {
                status: {
                    [Op.eq] : 'active'
                },
                is_offer_for_store: {
                    [Op.eq] : true
                }
            }
        }
    ]
});


Store.hasMany(Offer, { foreignKey: "store_id", target: "id" });
Offer.belongsTo(Store, { foreignKey: "store_id" });


module.exports = Offer;