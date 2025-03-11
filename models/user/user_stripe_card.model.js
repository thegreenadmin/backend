const { Op } = require('sequelize');
const {DataTypes} = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const sequelize = global['sequelize'];
const User = require('./user.model');
const UserAddress = require('./user_address.model');
const UserStripe = require('./user_stripe.model');

const UserStripeCard = sequelize.define('user_stripe_card', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    user_stripe_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: UserStripe,
            key: 'id'
        }
    },

    stripe_card_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },


    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


UserStripe.hasMany(UserStripeCard, {foreignKey: "user_stripe_id", target: "id"});

UserStripeCard.belongsTo(UserStripe, {foreignKey: "user_stripe_id"});


module.exports = UserStripeCard;