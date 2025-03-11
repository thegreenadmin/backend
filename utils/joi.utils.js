require('custom-env').env(true)

const Joi = require('joi').extend(require('@joi/date'));
const { LAST_NAME_REQUIRED, FIRST_NAME_REQUIRED, INVALID_EMAIL_FORMAT, EMAIL_REQUIRED, INVALID_PHONE_NUMBER, PHONE_NUMBER_REQUIRED, INVALID_DATE_FORMAT, DOB_REQUIRED, DEVICE_ID_REQUIRED, OTP_IS_REQUIRED, DEVICE_TOKEN_REQUIRED, INVALID_FILE_PATH, INVALID_IMAGE_EXTENSION, IMAGE_REQUIRED } = require('./messages.util');
const { sendBadRequestResponse } = require('../utils/response.util');


function _handleBodyValidation(schema, req, res, next) {
    const result = schema.validate(req.body);
    if(result.error) {
        return sendBadRequestResponse(res, {}, result.error);
    }
    next()
}

function _handleQueryValidation(schema, req, res, next) {
    const result = schema.validate(req.query);
    if(result.error) {
        return sendBadRequestResponse(res, {}, result.error);
    }
    next()
}


module.exports = {
    JOI_HANDLE_BODY_VALIDATION: _handleBodyValidation,
    JOI_HANDLE_QUERY_VALIDATION: _handleQueryValidation,
    JOI_FIRST_NAME: Joi.string().min(2).messages({"any.required": FIRST_NAME_REQUIRED, "string.min": "First name must contains 2 characters"}),
    JOI_LAST_NAME: Joi.string().min(2).messages({"any.required": LAST_NAME_REQUIRED, "string.min": "Last name must contains 2 characters"}),
    JOI_EMAIL: Joi.string().email().messages({"string.email": INVALID_EMAIL_FORMAT, "any.required": EMAIL_REQUIRED}),
    JOI_PHONE: Joi.string().regex(/^\+\d{1,3}\d{6,14}$/).messages({"string.pattern.base": INVALID_PHONE_NUMBER, "any.required": PHONE_NUMBER_REQUIRED}),
    JOI_DOB: Joi.date().format("YYYY-MM-DD").messages({'date.format': INVALID_DATE_FORMAT, "any.required": DOB_REQUIRED}),
    JOI_OTP: Joi.string().messages({"any.required": OTP_IS_REQUIRED}),
    JOI_DEVICE_ID: Joi.string().messages({"any.required": DEVICE_ID_REQUIRED}),
    JOI_DEVICE_TOKEN: Joi.string().min(2).messages({"any.required": DEVICE_TOKEN_REQUIRED}),
    JOI_STRING: Joi.string(),
    JOI_NUMBER: Joi.number(),
    JOI_DATE: Joi.date().format("YYYY-MM-DD").messages({'date.format': INVALID_DATE_FORMAT}),
    JOI_BOOLEAN: Joi.boolean(),
    JOI_IMAGE: Joi.string().custom((value, helpers) => {
        if (!value.startsWith(process.env.AWS_S3_DOMAIN)) {
            return helpers.message(INVALID_FILE_PATH);
        }
        if(!(/\.(jpg|jpeg|png)$/.test(value))) {
            return helpers.message(INVALID_IMAGE_EXTENSION)
        }
        return value;
    }).regex(/\.(jpg|jpeg|png)$/).messages({"any.required": IMAGE_REQUIRED}),

}