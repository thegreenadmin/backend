const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const Offer = require('../offer/offer.model');
const Order = require('../order/order.model');
const Store = require('../store/store.model');
const User = require('../user/user.model');
const sequelize = global['sequelize'];


const MessageHead = sequelize.define('message_head', {
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


    offer_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Offer,
            key: 'id'
        }
    },

    order_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Order,
            key: 'id'
        }
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

    is_available_for_store: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    },


    is_available_for_user: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    },


    is_store_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    },

    is_user_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});

Store.hasMany(MessageHead, { foreignKey: "store_id", target: "id" });
Offer.hasMany(MessageHead, { foreignKey: "offer_id", target: "id" });
Order.hasMany(MessageHead, { foreignKey: "order_id", target: "id" });
User.hasMany(MessageHead, { foreignKey: "user_id", target: "id" });

MessageHead.belongsTo(Store, { foreignKey: "store_id" });
MessageHead.belongsTo(Offer, { foreignKey: "offer_id" });
MessageHead.belongsTo(Order, { foreignKey: "order_id" });
MessageHead.belongsTo(User, { foreignKey: "user_id" });



module.exports = MessageHead;