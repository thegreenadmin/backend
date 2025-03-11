const UserSession = require('../models/user/user_sessions.model');
const MESSAGES = require('../utils/messages.util');
const { sendUnauthorizedResponse, sendConflictResponse } = require('../utils/response.util');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { Op } = require('sequelize');
const Admin = require('../models/admin/admin.model');
const StoreUser = require('../models/store/store_users.model');
const Store = require('../models/store/store.model');
const Role = require('../models/store/role.model');
const Permission = require('../models/store/permission.model');
const Controller = require('../models/module/controller.model');
const logger = require('../logger/logger');
const User = require('../models/user/user.model');
const BlockUser = require('../models/user/block_user.model');



const userAuth = async function (req, res, next) {
    const payload = {};
    try{
        if(!req.headers.authorization) {
            throw MESSAGES.UNAUTHORIZED_ACCESS;
        }
        const token = req.headers.authorization.split('Bearer ')[1];
        const __TOKEN__DATA = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY).data;


        const __USER = await User.findOne({
            where: {id: __TOKEN__DATA.id, is_account_deleted: false, status: 'active'},
            include: [
                {
                    model: BlockUser,
                    required: false,
                    where: {status: 'active'}
                }
            ]
        })

        if(!__USER) {
            throw MESSAGES.UNAUTHORIZED_ACCESS
        }

        if(__USER.block_users.length) {
            throw "Account is blocked, kindly contact the administrator for furthur process"
        }


        const __USER_SESSION = await UserSession.findOne({
            where: {
                id: __TOKEN__DATA.session_id
            }
        });

        const sessionExpiredAt = moment(__USER_SESSION.expiredAt).utc();
        const currentDate = moment().utc();

        if(!__USER_SESSION || __USER_SESSION.status == 'deleted' ) {
            throw MESSAGES.INVALID_SESSION;
        }

        req['payload'] = {
            user: __TOKEN__DATA,
        }

        next();

    }catch(err) {
        sendUnauthorizedResponse(res, {}, err.message);
    }
    // req.payload = payload;
    // res.send(jwt.verify(token, process.env.JWT_ENCRYPTION_KEY));
}

const hasUserAuth = async function (req, res, next) {
    const payload = {};
    try{
        if(!req.headers.authorization) {
            return next();
        }

        return userAuth(req, res, next);
    }catch(err) {
        sendUnauthorizedResponse(res, {}, err);
    }
}

const adminAuth = async function (req, res, next) {
    const payload = {};
    try{
        if(!req.headers.authorization) {
            throw MESSAGES.UNAUTHORIZED_ACCESS;
        }
        const token = req.headers.authorization.split('Bearer ')[1];
        const __TOKEN__DATA = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY).data;

        const admin = await Admin.findOne({where: {id: __TOKEN__DATA.id}});
        if(!admin) {
            throw "Admin not found";
        }

        req.payload = {
            admin,
        }
        next();
    }catch(err) {
        sendUnauthorizedResponse(res, {}, err);
    }
}

const permissionAuth = function(controllers = []) {
    return async function(req, res, next) {
        try{
            const user_id = req.payload.user.id;
            if(!user_id) {
                throw MESSAGES.UNAUTHORIZED_ACCESS;
            }
    
            const store_id = req.query.store_id || req.body.store_id;
            if(!store_id) {
                throw "Store not found"
            }

            const __STORE_USER = await StoreUser.findOne(
                {
                    where: {user_id, store_id, status: 'active'},
                    include: [
                        {
                            model: Store,
                            required: false,
                            where: {is_verified: true, status: 'active'}
                        },
                        {
                            model: Role,
                            required: false,
                            where: {status: 'active'},
                            include: [
                                {
                                    model: Permission,
                                    required: false,
                                    where: {status: 'active'},
                                    include: [
                                        {
                                            model: Controller,
                                            required: true,
                                            where: {
                                                controller_key: {[Op.in]: controllers},
                                                only_store_owner_accessible: false, status: 'active'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );

            if(!__STORE_USER) {
                throw MESSAGES.UNAUTHORIZED_ACCESS;
            }

            if(__STORE_USER.is_store_owner) {
                return next();
            }

            if(!__STORE_USER.role) {
                throw "You are not authorised to perform this action.";
            }


            if(!__STORE_USER.role.permissions.length) {
                throw "You are not authorised to perform this action.";
            }

            return next();            
        }catch(err) {
            sendConflictResponse(res, {}, err);
        }

    }
}
module.exports = {
    userAuth, hasUserAuth, adminAuth, permissionAuth
}
