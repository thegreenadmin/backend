const Joi = require("joi");
const {
  JOI_STRING,
  JOI_NUMBER,
  JOI_BOOLEAN,
  JOI_HANDLE_BODY_VALIDATION,
  JOI_HANDLE_QUERY_VALIDATION,
} = require("../utils/joi.utils");

const recipientLookupValidator = function (req, res, next) {
  const schema = Joi.object({
    payload: JOI_STRING.label("QR payload").optional(),
    merchant_id: JOI_NUMBER.label("Merchant id").optional(),
    phone: JOI_STRING.label("Phone").optional(),
    phone_code: JOI_STRING.label("Phone code").optional(),
  }).or("payload", "merchant_id", "phone");
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const qrGenerateValidator = function (req, res, next) {
  const schema = Joi.object({
    actor_type: JOI_STRING.valid("user", "merchant").label("Actor type").required(),
    store_id: JOI_NUMBER.label("Store id").optional(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const qrDecodeValidator = function (req, res, next) {
  const schema = Joi.object({
    payload: JOI_STRING.label("QR payload").required(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const createPaymentValidator = function (req, res, next) {
  const schema = Joi.object({
    idempotency_key: JOI_STRING.label("Idempotency key").required(),
    amount: JOI_NUMBER.label("Amount").positive().required(),
    note: JOI_STRING.allow("", null).label("Note").optional(),
    // payee resolution: either a scanned QR payload, or explicit ids/phone
    payload: JOI_STRING.label("QR payload").optional(),
    merchant_id: JOI_NUMBER.label("Merchant id").optional(),
    phone: JOI_STRING.label("Phone").optional(),
    phone_code: JOI_STRING.label("Phone code").optional(),
  }).or("payload", "merchant_id", "phone");
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const confirmPaymentValidator = function (req, res, next) {
  const schema = Joi.object({
    payment_intent_id: JOI_NUMBER.label("Payment intent id").required(),
    idempotency_key: JOI_STRING.label("Idempotency key").optional(),
    biometric_verified: JOI_BOOLEAN.label("Biometric verified").optional(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const paymentIntentIdBodyValidator = function (req, res, next) {
  const schema = Joi.object({
    payment_intent_id: JOI_NUMBER.label("Payment intent id").required(),
  });
  JOI_HANDLE_BODY_VALIDATION(schema, req, res, next);
};

const paymentStatusValidator = function (req, res, next) {
  const schema = Joi.object({
    payment_intent_id: JOI_NUMBER.label("Payment intent id").required(),
  });
  JOI_HANDLE_QUERY_VALIDATION(schema, req, res, next);
};

module.exports = {
  recipientLookupValidator,
  qrGenerateValidator,
  qrDecodeValidator,
  createPaymentValidator,
  confirmPaymentValidator,
  paymentIntentIdBodyValidator,
  paymentStatusValidator,
};
