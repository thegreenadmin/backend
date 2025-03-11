const {DataTypes} = require('sequelize');
const DeliveryService = require('../delivery/delivery_service.model');
const Store = require('../store/store.model');
const User = require('../user/user.model');
const OrderStatus = require('./order_status.model');
const sequelize = global['sequelize'];

const Order = sequelize.define('order', {
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
            isInt: true,
        },
        references: {
            model: Store,
            key: 'id'
        }
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


    delivery_charge: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    

    tax_type: {
        type: DataTypes.ENUM,
        allowNull: false, 
        values: ['percentage', 'amount']
    },

    tax_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_tax_charged: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    service_charge_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['percentage', 'amount']
    },

    service_charge_value: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    total_service_charged: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },


    total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    customer_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        }
    },

    customer_phone: {
        type: DataTypes.STRING(25),
        allowNull: false
    },

    customer_phone_code: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    estimate_delivery_date: {
        type: DataTypes.DATE
    },

    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        default: new Date()
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});




User.hasMany(Order, { foreignKey: "user_id", target: "id" });
Store.hasMany(Order, { foreignKey: "store_id", target: "id" });
DeliveryService.hasMany(Order, { foreignKey: "delivery_service_id", target: "id" });


Order.belongsTo(User, { foreignKey: "user_id" });
Order.belongsTo(Store, { foreignKey: "store_id" });
Order.belongsTo(DeliveryService, { foreignKey: "delivery_service_id" });




module.exports = Order;