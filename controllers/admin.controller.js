require('custom-env').env(true)

const moment = require('moment');
var jwt = require('jsonwebtoken');
const Admin = require('../models/admin/admin.model');
const Order = require('../models/order/order.model');
const Store = require('../models/store/store.model');
const User = require('../models/user/user.model');
const HELPERS = require('../utils/helper.utils');
const MESSAGES = require('../utils/messages.util');
const BcryptController = require('./bcrypt.controller');
const S3Controller = require('./s3.controller');
const AdminForgotPassword = require('../models/admin/admin_forgot_password.model');
const SNSController = require('./sns.controller');
const { forgotPassword_Template } = require('../config/email_templates.config');
const { Op } = require('sequelize');
const logger = require('../logger/logger');
const MembershipPlan = require('../models/transaction/membership_plan.model');
const Membership = require('../models/transaction/membership.model');
const CommonController = require('./common.controller');
const DefaultRole = require('../models/module/default_role.model');
const DefaultPermission = require('../models/module/default_permission.model');





const createAdmin = async function(data){
    // data = {email, password, name}
    const hashPassword = await BcryptController.createHashPassword(data.password);
    const {email, name} = data;
    const admin = await Admin.create({email, name, password: hashPassword, status: 'active'});

    return admin;
}


const loginAdmin = async function(data){
    // data = {email, password}
    const {email, password} = data;
    const admin = await Admin.findOne({where: {email: email, status: 'active'}});
    if(admin) {
        const hashComparision = await BcryptController.compareHash(password, admin.password);
        if(hashComparision) {
            const token = jwt.sign({
                data: {
                    id: admin.id, email: admin.email, isAdmin: true
                },
                exp: HELPERS.getSecondsFromDaysCount(process.env.JWT_TOKEN_EXPIARATION)    // 1 week
            }, process.env.JWT_ENCRYPTION_KEY);
            return token;
        }else{
            throw Error(MESSAGES.PASSWORD_NOT_MATCH);
        }
    }else{
        throw Error(MESSAGES.USER_NOT_FOUND);
    }
}



const getAdminDetails = async function (admin_id) {
    try{
        const __ADMIN = await Admin.findOne(
            {
                where: {id: admin_id, status: 'active'},
                attributes: [
                    ['id', 'admin_id'],
                    'image_url', 'name', 'email', 'status'
                ]
            }
        );
        if(!__ADMIN) {
            throw "Admin not found"
        }
        const image = S3Controller.getAwsS3SignedFileUrl(__ADMIN.image_url);
        const admin = Object.assign({image}, __ADMIN.toJSON());
        delete admin.image_url;

        return {admin};
    }catch(err) {
        throw err;
    }
}


const deleteAdmin = async function(data){
    // data = {admin_id}
    const {admin_id} = data;
    const admin = await Admin.findOne({where: {id: admin_id}})

    if(admin.email == process.env.ADMIN_EMAIL) {
        throw "Could not delete the super admin"
    }

    await Admin.update({status: 'deleted'}, {where: {id: admin_id}});

    return {
        is_deleted: true
    };
}


const listAdmins = async function(data){
    const admins = await Admin.findAll({where: {status: 'active'}, order: [['id', 'DESC']] });
    return {
        admins
    };
}


const createForgotPasswordLink = async function(data) {
    // data = {email}
    try{
        const {email} = data;
        const __ADMIN = await Admin.findOne({where: {email, status: 'active'}});
        if(!__ADMIN) {throw "Admin not found"}

        const key = HELPERS.getRandomVerificationCode();
        const afterSevenDays = moment().utc().add(7, 'days');

        const __ADMIN_FORGOT_PASSWORD = await AdminForgotPassword.create({
            admin_id: __ADMIN.id,
            key,
            expired_at: afterSevenDays,
            status: 'active'
        })

        const template = forgotPassword_Template(__ADMIN_FORGOT_PASSWORD.id, key)
        await SNSController.sendEmail(__ADMIN.email, "Reset password", template,process.env.ADMIN_EMAIL);

        return {admin_forgot_password_id: __ADMIN_FORGOT_PASSWORD.id}

    }catch(err) {
        throw err;
    }
}






const verifyLinkAndCreateNewPassword = async function(data) {
    // data = {admin_forgot_password_id, key, password}
    try{
        const {admin_forgot_password_id, key, password} = data;

        const __ADMIN_FORGOT_PASSWORD = await AdminForgotPassword.findOne({
            where: {id: admin_forgot_password_id, key, expired_at: {[Op.gte]: moment().utc().toDate()}}
        })

        if(!__ADMIN_FORGOT_PASSWORD) {
            throw "Link is expired"
        }

        const hashPassword = await BcryptController.createHashPassword(password);
        await Admin.update({password: hashPassword}, {where: {id: __ADMIN_FORGOT_PASSWORD.admin_id}});

        return {is_updated: true}

    }catch(err) {
        throw err;
    }
}










const changePassword = async function(data, admin_id) {
    // data = {previous_password, new_password}
    try{
        const {previous_password, new_password} = data;
        const __ADMIN = await Admin.findOne(
            {
                where: {id: admin_id, status: 'active'},
            }
        );
        const hashComparision = await BcryptController.compareHash(previous_password, __ADMIN.password);

        if(!hashComparision) {
            throw "Current password is invalid"
        }

        const hashPassword = await BcryptController.createHashPassword(new_password);
        await Admin.update({password: hashPassword}, {where: {id: admin_id}})
        
        return {is_updated: true}
    }catch(err) {
        throw err
    }
}





const updateAdminProfile = async function(data, admin_id) {
    // data = {name, image_url}
    try{
        const {name, image_url, email} = data;

        await Admin.update({name, image_url, email}, {where: {id: admin_id}});
        return {is_updated: true}
    }catch(err) {
        throw err;
    }
}







const getDashsboardDetails = async function() {
    try{
        const totalUsers = await User.count({where: {status: 'active'}})
        const totalStores = await Store.count({where: {status: 'active'}})
        const totalOrders = await Order.count({where: {status: 'active'}})

        return {
            total_users: totalUsers,
            total_stores: totalStores,
            total_orders: totalOrders
        }

    }catch(err) {
        throw err;
    }
}









const listMembershipUsers = async function(data) {
    // data = {page, page_size, order_by, order_type}
    try{
        const {page, page_size, order_by, order_type} = data;

        const order = (order_by && order_type) ? [[ (order_by == 'membership_id' ? 'id' : order_by), order_type ]] : [['id', "DESC"]];
        const query = {
            where: {status: 'active'},
            attributes: {
                include: [['id', 'membership_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: User,
                },
                {
                    model: MembershipPlan
                }
            ]
        }

        const __MEMBERSHIPS = await CommonController.getPaginationResult({
            Model: Membership, page, page_size, order, query, as: 'memberships'
        })

        return __MEMBERSHIPS;
    }catch(err) {
        throw err;
    }
}



const membershipPlanUpdate = async function(data) {
    // data = {membership_plan_id, plan_name, plan_30_charge, plan_90_charge, plan_180_charge, plan_365_charge, plan_description}
    try{
        const {membership_plan_id, plan_name, plan_30_charge, plan_90_charge, plan_180_charge, plan_365_charge, plan_description} = data;
        const __UPDATE_PLAN = await MembershipPlan.update({
            plan_name, plan_30_charge, plan_90_charge, plan_180_charge, plan_365_charge, plan_description
        },{
            where: {id: membership_plan_id}
        })

        return {
            is_updated: true
        }

    }catch(err) {
        throw err
    }
}


const listDefaultRoles = async function(data) {
    try{
        const __DEFAULT_ROLES = await DefaultRole.findAll({
            where: {status: "active"},
            attributes: [['id', 'default_role_id'], 'role_name']
        });
        return {default_roles: __DEFAULT_ROLES};
    }catch(err) {
        throw err;
    }
}


const getRoleDetails = async function(data) {
    // data = {default_role_id}
    try{
        const {default_role_id} = data;
        const __DEFAULT_ROLE = await DefaultRole.findOne({
            where: {id: default_role_id},
            attributes: [['id', 'default_role_id'], 'role_name'],
            include: [{
                model: DefaultPermission,
                required: false,
                where: { status: "active"},
                attributes: ['controller_id']
            }]
        })
        return {default_role: __DEFAULT_ROLE}
    }catch(err) {
        throw err;
    }
}


const updateRolePermissions = async function(data) {
    // data = {default_role_id, default_permissions}
    // default_permissions = [controller_id]
    try{
        const {default_role_id, default_permissions} = data;
        await DefaultPermission.update({status: "deleted"}, {where: {default_role_id}})
        if(default_permissions.length) {
            await DefaultPermission.bulkCreate(default_permissions.map((controller_id) => {
                return {
                    controller_id,
                    default_role_id,
                    status: "active"
                }
            }))
        }

        return {is_updated: true}
    }catch(err) {
        throw err;
    }
}


module.exports = {
    createAdmin, loginAdmin, getAdminDetails, getDashsboardDetails,
    createForgotPasswordLink, verifyLinkAndCreateNewPassword, changePassword,
    updateAdminProfile, listMembershipUsers, membershipPlanUpdate, listDefaultRoles, 
    getRoleDetails, updateRolePermissions, deleteAdmin, listAdmins
}