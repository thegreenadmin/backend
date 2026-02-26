const Joi = require("joi");
const {
  JOI_FIRST_NAME,
  JOI_LAST_NAME,
  JOI_EMAIL,
  JOI_PHONE,
  JOI_DOB,
  JOI_HANDLE_BODY_VALIDATION,
  JOI_OTP,
  JOI_DEVICE_ID,
  JOI_DEVICE_TOKEN,
  JOI_IMAGE,
  JOI_NUMBER,
  JOI_STRING,
  JOI_DATE,
  JOI_BOOLEAN,
} = require("../utils/joi.utils");

const userCreateValidator = function (req, res, next) {
  const schema = Joi.object({
    first_name: JOI_FIRST_NAME.required(),
    last_name: JOI_LAST_NAME.required(),
    email: JOI_EMAIL.required(),
    phone: JOI_STRING.required(),
    phone_code: JOI_STRING.required(),
    dob: JOI_DOB.required(),
    has_store_access: JOI_BOOLEAN.required(),
    is_store_owner: JOI_BOOLEAN.required(),
  });

  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const generateOTPValidator = function (req, res, next) {
  const schema = Joi.object({
    phone: JOI_STRING.required(),
    phone_code: JOI_STRING.required(),
  });

  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const verifyOTPValidator = function (req, res, next) {
  const schema = Joi.object({
    phone: JOI_STRING.required(),
    phone_code: JOI_STRING.required(),
    otp: JOI_OTP.required(),
    device_id: JOI_DEVICE_ID.required(),
    device_token: JOI_DEVICE_TOKEN.required(),
    device_type: JOI_STRING.required(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const createUserProofValidator = function (req, res, next) {
  const schema = Joi.object({
    proof_type_id: JOI_NUMBER.label("Proof type id").required(),
    proof_value: JOI_STRING.label("Proof value").required(),
    image_url: JOI_IMAGE.label("Proof Image").required(),
    expiredAt:
      req.body.expiredAt != "" ? JOI_DATE.label("Expiary Date").required() : "",
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const createFavouriteStoreValidator = function (req, res, next) {
  const schema = Joi.object({
    store_id: JOI_NUMBER.label("Store id").required(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const removeFavouriteStoreValidator = function (req, res, next) {
  const schema = Joi.object({
    store_id: JOI_NUMBER.label("Favourite store id").required(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

module.exports = {
  userCreateValidator,
  generateOTPValidator,
  verifyOTPValidator,
  createUserProofValidator,
  createFavouriteStoreValidator,
  removeFavouriteStoreValidator,
};
