const {DataTypes, Op, fn, col} = require('sequelize');
const Store = require('../store/store.model');
const sequelize = global['sequelize'];

const Category = sequelize.define('category', {
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

    parent_category_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
            min: 0,
            isInt: true,
        }
    },
    category_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    image_url: {
        type: DataTypes.TEXT
    },
    is_featured_category: {
        type: DataTypes.BOOLEAN, 
        allowNull: false
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
            fields: ['store_id', fn('lower', col('category_name'))],
            where: {
                status: {
                    [Op.eq] : 'active',
                },
                parent_category_id: null
            }
        },

        {
            unique: true,
            fields: ['store_id', 'parent_category_id', fn('lower', col('category_name'))],
            where: {
                status: {
                    [Op.eq] : 'active',
                },
            }
        }
    ]
});



Store.hasMany(Category, { foreignKey: "store_id", target: "id" });
Category.hasMany(Category, { foreignKey: "parent_category_id", target: "id" });

Category.belongsTo(Store, { foreignKey: "store_id" });
Category.belongsTo(Category, { foreignKey: "parent_category_id" });

module.exports = Category;