const { DataTypes } = require('sequelize');
const Country = require('./country.model');
const sequelize = global['sequelize'];

// Per-country availability of app verticals. Rows are seeded enabled for every
// country so rollout changes nothing until an admin turns a feature off.
const CountryFeature = sequelize.define('country_feature', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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

    feature_key: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['munchies', 'herbs', 'payments']
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
        defaultValue: 'active'
    }
},
{
    indexes: [
        {
            unique: true,
            fields: ['country_id', 'feature_key']
        }
    ]
});

Country.hasMany(CountryFeature, { foreignKey: "country_id", target: "id" });
CountryFeature.belongsTo(Country, { foreignKey: "country_id" });

module.exports = CountryFeature;
