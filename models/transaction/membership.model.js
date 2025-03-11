const { DataTypes } = require('sequelize');
const Store = require('../store/store.model');
const User = require('../user/user.model');
const MembershipPlan = require('./membership_plan.model');
const PaymentService = require('./payment_service.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const Membership = sequelize.define('membership', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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


    membership_plan_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: MembershipPlan,
            key: 'id'
        }
    },

    transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Transaction,
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

    membership_charge: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },

    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


User.hasMany(Membership, { foreignKey: "user_id", target: "id" });
MembershipPlan.hasMany(Membership, { foreignKey: "membership_plan_id", target: "id" });
Transaction.hasMany(Membership, { foreignKey: "transaction_id", target: "id" });
Store.hasMany(Membership, { foreignKey: "store_id", target: "id" });


Membership.belongsTo(User, { foreignKey: "user_id" });
Membership.belongsTo(MembershipPlan, { foreignKey: "membership_plan_id" });
Membership.belongsTo(Transaction, { foreignKey: "transaction_id" });
Membership.belongsTo(Store, { foreignKey: "store_id" });



module.exports = Membership;