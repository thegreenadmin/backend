const Joi = require('joi');
const { JOI_STRING, JOI_HANDLE_BODY_VALIDATION, JOI_NUMBER, JOI_HANDLE_QUERY_VALIDATION } = require('../utils/joi.utils');



const createStoreValidator = function(req, res, next) {
    const schema = Joi.object({
        store_name: JOI_STRING.label('Store name').required(),
    })
    JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
}


const createStoreUserValidator = function(req, res, next) {
    const schema = Joi.object({
        store_id: JOI_NUMBER.label('Store id').required(),
        user_id: JOI_NUMBER.label('User id').required()
    })
    JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
}


const verifyStoreUserValidator = function(req, res, next) {
    const schema = Joi.object({
        store_user_id: JOI_STRING.label('User id').required(),
        verification_code: JOI_STRING.label('Verification code').required()
    })
    JOI_HANDLE_QUERY_VALIDATION(schema, req, res, next);
}









module.exports = {
    createStoreValidator, createStoreUserValidator, verifyStoreUserValidator
}