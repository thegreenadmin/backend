const { DataTypes, fn, col, Op } = require('sequelize');
const sequelize = global['sequelize'];
const Sequelize = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.STRING,
    },
    user_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        default: 0
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[0-9]{6,20}$/
        }
    },
    phone_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            is: /^\+\d{1,6}/
        }
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(100),
    },
    nick_name: {
        type: DataTypes.STRING(100),
    },
    image_url: {
        type: DataTypes.TEXT
    },
    dob: {
        type: DataTypes.DATE,
    },

    has_store_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false
    },

    is_account_deleted: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    store_access_registeration_detail: {
        type: DataTypes.TEXT
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
},
{
    indexes: [
        {
            unique: true,
            fields: [ 'phone', 'phone_code', fn('lower', col('email'))],
            where: {
                status: 'active',
                email: {[Op.ne]: null},
                is_account_deleted: false
            }
        }
    ]
});

User.addHook('afterCreate', (user, options) => {
    user.uuid = "TGM"+(1000000 + user.id)
    setTimeout(async () => {
        await User.update({uuid: "TGM"+(1000000 + user.id)}, {where: {id: user.id}})
    },10000)
})


module.exports = User;