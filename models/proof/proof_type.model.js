const { DataTypes } = require('sequelize');
const sequelize = global['sequelize'];


const ProofType = sequelize.define('proof_type', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    proof_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    has_expiration: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false
    },

    is_enabled: {
        type: DataTypes.BOOLEAN,
        default: true,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted']
    }
});



module.exports = ProofType;

// (async () => {
//     await ProofType.create({proof_name: "Aadhar", has_expiration: false, is_enabled: true, status: 'active'})
//     await ProofType.create({proof_name: "PAN", has_expiration: false, is_enabled: false, status: 'active'})
//     await ProofType.create({proof_name: "Driving License", has_expiration: true, is_enabled: true, status: 'active'})
    
    
// })()