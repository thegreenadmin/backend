const { Op, fn, col } = require('sequelize');
const { DataTypes } = require('sequelize');
const Order = require('../order/order.model');
const OrderHistory = require('../order/order_history.model');
const User = require('../user/user.model');
const Store = require('../store/store.model');
const MessageHead = require('../message/message_head.model');
const Offer = require('../offer/offer.model');
const ContactQuery = require('../contact/contact_query.model');
const ClaimStore = require('../store/claim_store.model');
const sequelize = global['sequelize'];

const AdminNotification = sequelize.define('admin_notification', {
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
        },
        references: {
            model: Store,
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


    contact_query_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: ContactQuery,
            key: 'id'
        }
    },

    claim_store_id: {
        type: DataTypes.BIGINT,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: ClaimStore,
            key: 'id'
        }
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
    },


    message: {
        type: DataTypes.TEXT,
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
    }
});



Store.hasMany(AdminNotification, { foreignKey: "store_id", target: "id" });
Order.hasMany(AdminNotification, { foreignKey: "order_id", target: "id" });
ContactQuery.hasMany(AdminNotification, { foreignKey: "contact_query_id", target: "id" });
ClaimStore.hasMany(AdminNotification, { foreignKey: "claim_store_id", target: "id" });




AdminNotification.belongsTo(Store, { foreignKey: "store_id" });
AdminNotification.belongsTo(Order, { foreignKey: "order_id" });
AdminNotification.belongsTo(ContactQuery, { foreignKey: "contact_query_id" });
AdminNotification.belongsTo(ClaimStore, { foreignKey: "claim_store_id" });




module.exports = AdminNotification;