const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const Country = require('./country.model');
const sequelize = global['sequelize'];

const State = sequelize.define('state', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },

    country_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: Country,
            key: 'id'
        }
    },

    state_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});


Country.hasMany(State, { foreignKey: "country_id", target: "id" });
State.belongsTo(Country, { foreignKey: "country_id" });

module.exports = State;