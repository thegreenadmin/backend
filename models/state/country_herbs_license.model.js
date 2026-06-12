const { DataTypes, Op } = require('sequelize');
const Country = require('./country.model');
const User = require('../user/user.model');
const sequelize = global['sequelize'];

// The single licensed herbs provider per country. Only this user may own
// stores with store_type = 'herbs' in that country. The license does not
// restrict the same user from owning general/munchies stores.
const CountryHerbsLicense = sequelize.define('country_herbs_license', {
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
            // one active provider per country; revoked rows stay for history
            unique: true,
            fields: ['country_id'],
            where: {
                status: {
                    [Op.eq]: 'active'
                }
            }
        }
    ]
});

Country.hasMany(CountryHerbsLicense, { foreignKey: "country_id", target: "id" });
CountryHerbsLicense.belongsTo(Country, { foreignKey: "country_id" });
User.hasMany(CountryHerbsLicense, { foreignKey: "user_id", target: "id" });
CountryHerbsLicense.belongsTo(User, { foreignKey: "user_id" });

module.exports = CountryHerbsLicense;
