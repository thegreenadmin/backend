const { DataTypes } = require('sequelize');
const User = require('../user/user.model');
const UserStripeCard = require('../user/user_stripe_card.model');
const Transaction = require('./transaction.model');
const sequelize = global['sequelize'];

const UserWalletAutoCharge = sequelize.define('user_wallet_auto_charge', {
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

    user_stripe_card_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserStripeCard,
            key: 'id'
        }
    },

    auto_charge_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['threshold', 'cyclic']
    },

    threshold_amount: {
        type: DataTypes.DOUBLE
    },

    charge_amount: {
        type: DataTypes.DOUBLE
    },

    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        default: new Date()
    },

    frequency: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    day: {
        type: DataTypes.INTEGER
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
            fields: ['user_id'],
            where: {status: 'active'}
        }
    ]
});


User.hasMany(UserWalletAutoCharge, { foreignKey: "user_id", target: "id" });
UserStripeCard.hasMany(UserWalletAutoCharge, { foreignKey: "user_stripe_card_id", target: "id" });


UserWalletAutoCharge.belongsTo(User, { foreignKey: "user_id" });
UserWalletAutoCharge.belongsTo(UserStripeCard, { foreignKey: "user_stripe_card_id" });


module.exports = UserWalletAutoCharge;