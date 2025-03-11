const { Op } = require('sequelize');
const { DataTypes } = require('sequelize');
const { foreignRelationCreateTableTimeout } = require('../../utils/helper.utils');
const { EXPIARY_DATE_REQUIRED } = require('../../utils/messages.util');
const ProofType = require('../proof/proof_type.model');
const sequelize = global['sequelize'];
const User = require('./user.model');


const UserProof = sequelize.define('user_proof', {
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

    proof_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            isInt: true,
        },
        references: {
            model: ProofType,
            key: 'id'
        }
    },

    proof_value: {
        type: DataTypes.STRING,
        allowNull: false
    },

    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    expiredAt: {
        type: DataTypes.DATE,
        validate: {
            async requiredIfExpired(value) {
                const expiredRequired = await ProofType.findOne({where: {id: this.proof_type_id, status: 'active', has_expiration: true}})
                if(!value && expiredRequired) {
                    throw Error(EXPIARY_DATE_REQUIRED);
                }
            }
        }
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
            fields: ['user_id', 'proof_type_id'],
            where: {
                status: {
                    [Op.eq] : 'active'
                }
            }
        }
    ]
});


User.hasMany(UserProof, { foreignKey: "user_id", target: "id" });
ProofType.hasMany(UserProof, { foreignKey: "proof_type_id", target: "id" });

UserProof.belongsTo(User, { foreignKey: "user_id" });
UserProof.belongsTo(ProofType, { foreignKey: "proof_type_id" });


module.exports = UserProof;