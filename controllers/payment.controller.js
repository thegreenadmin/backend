const crypto = require("crypto");
const { Op } = require("sequelize");
const sequelize = global["sequelize"];

const config = require("./../config/config.json");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");

const User = require("../models/user/user.model");
const Store = require("../models/store/store.model");
const Transaction = require("../models/transaction/transaction.model");
const PaymentService = require("../models/transaction/payment_service.model");
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model");
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model");
const PaymentIntent = require("../models/transaction/payment_intent.model");
const UserProof = require("../models/user/user_proof.model");
const ProofType = require("../models/proof/proof_type.model");

const PAY = config.p2p_payments;
const QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || "tgm_qr_dev_secret_change_me";

/**
 * Typed error so routes can return a machine-readable code to the app
 * (e.g. KYC_REQUIRED → open license upload, QR_EXPIRED → rescan).
 */
class PaymentError extends Error {
  constructor(code, message, data = {}) {
    super(message);
    this.code = code;
    this.data = data;
    this.isPaymentError = true;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const round2 = (n) => Number(Number(n).toFixed(2));

const maskPhone = function (phone = "") {
  const s = String(phone);
  if (s.length <= 4) return s;
  return s.slice(0, 2) + "****" + s.slice(-2);
};

const getWalletPaymentService = async function () {
  const service = await PaymentService.findOne({
    where: {
      payment_service_name: { [Op.iLike]: "user wallet" },
      is_enabled: true,
      status: "active",
    },
  });
  if (!service) throw new PaymentError("WALLET_UNAVAILABLE", "Wallet transactions are currently unavailable");
  return service.toJSON();
};

const buildUserProfile = function (user) {
  const u = user.toJSON ? user.toJSON() : user;
  let image = null;
  if (u.image_url) {
    try {
      image = S3Controller.getAwsS3SignedFileUrl(u.image_url);
    } catch (e) {
      image = null;
    }
  }
  return {
    type: "p2p",
    user_id: u.id,
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
    phone: maskPhone(u.phone),
    phone_code: u.phone_code,
    image,
  };
};

const buildStoreProfile = function (store) {
  const s = store.toJSON ? store.toJSON() : store;
  let image = null;
  const logo = s.logo_url || s.image_url;
  if (logo) {
    try {
      image = S3Controller.getAwsS3SignedFileUrl(logo);
    } catch (e) {
      image = null;
    }
  }
  return {
    type: "p2b",
    store_id: s.id,
    name: s.store_name || s.store_nick_name || "",
    phone: maskPhone(s.store_phone),
    phone_code: s.store_phone_code,
    image,
  };
};

const computeFee = function (type, amount) {
  const feeValue = type === "p2b" ? PAY.p2b_fee : PAY.p2p_fee;
  if (!feeValue) return 0;
  if (PAY.fee_type === "percentage") return round2((amount * feeValue) / 100);
  return round2(feeValue);
};

// ---------------------------------------------------------------------------
// Dynamic QR — signed, expiring payloads (spec 5.7.3)
// ---------------------------------------------------------------------------

const signQr = function (parts) {
  return crypto.createHmac("sha256", QR_SIGNING_SECRET).update(parts.join("|")).digest("hex");
};

/**
 * Build a signed dynamic QR for the current actor.
 * actor_type: 'user'  -> P2P receive / customer code (encodes user id)
 *             'merchant' -> P2B merchant code (encodes store id)
 */
const generateQrPayload = async function (data, user_id) {
  try {
    const actorType = data.actor_type === "merchant" ? "merchant" : "user";
    const validity = PAY.qr_validity_seconds || 300;
    const exp = Math.floor(Date.now() / 1000) + validity;
    const sid = crypto.randomBytes(12).toString("hex");
    const v = 1;

    let id;
    if (actorType === "merchant") {
      if (!data.store_id) throw new PaymentError("VALIDATION", "store_id is required for a merchant code");
      const store = await Store.findOne({ where: { id: data.store_id, status: "active" } });
      if (!store) throw new PaymentError("VALIDATION", "Store not found");
      id = store.id;
    } else {
      id = user_id;
    }

    const sig = signQr([v, actorType, id, sid, exp]);
    const payload = { v, t: actorType, id: String(id), sid, exp, sig };

    return {
      qr_string: JSON.stringify(payload),
      session_id: sid,
      expiresAt: new Date(exp * 1000),
      validity_seconds: validity,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Verify a scanned QR payload: signature + expiry. Returns the resolved,
 * safe profile of who/what is being paid. Replay (reused sid) is enforced at
 * confirm time via the unique qr_session_id on payment_intent.
 */
const decodeQrPayload = async function (data) {
  try {
    let payload;
    try {
      payload = typeof data.payload === "string" ? JSON.parse(data.payload) : data.payload;
    } catch (e) {
      throw new PaymentError("QR_INVALID", "Invalid or unsupported code.");
    }
    if (!payload || !payload.t || !payload.id || !payload.sid || !payload.exp || !payload.sig) {
      throw new PaymentError("QR_INVALID", "Invalid or unsupported code.");
    }

    const expectedSig = signQr([payload.v || 1, payload.t, payload.id, payload.sid, payload.exp]);
    const sigOk =
      payload.sig.length === expectedSig.length &&
      crypto.timingSafeEqual(Buffer.from(payload.sig), Buffer.from(expectedSig));
    if (!sigOk) throw new PaymentError("QR_INVALID", "Invalid or unsupported code.");

    if (Math.floor(Date.now() / 1000) > Number(payload.exp)) {
      throw new PaymentError("QR_EXPIRED", "This payment code has expired.");
    }

    if (payload.t === "merchant") {
      const store = await Store.findOne({ where: { id: payload.id, status: "active" } });
      if (!store) throw new PaymentError("QR_INVALID", "Invalid or unsupported code.");
      return { ...buildStoreProfile(store), session_id: payload.sid };
    }

    const user = await User.findOne({
      where: { id: payload.id, status: "active", is_account_deleted: false },
    });
    if (!user) throw new PaymentError("QR_INVALID", "Invalid or unsupported code.");
    return { ...buildUserProfile(user), session_id: payload.sid };
  } catch (err) {
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Recipient lookup (manual entry + QR)
// ---------------------------------------------------------------------------

const lookupRecipient = async function (data, user_id) {
  try {
    if (data.payload) {
      return await decodeQrPayload({ payload: data.payload });
    }
    if (data.merchant_id) {
      const store = await Store.findOne({ where: { id: data.merchant_id, status: "active" } });
      if (!store) throw new PaymentError("RECIPIENT_NOT_FOUND", "Merchant not found");
      return buildStoreProfile(store);
    }
    if (data.phone && data.phone_code) {
      const user = await User.findOne({
        where: {
          phone: data.phone,
          phone_code: data.phone_code,
          is_account_deleted: false,
          status: "active",
        },
      });
      if (!user) throw new PaymentError("RECIPIENT_NOT_FOUND", "No TGM user found for this number");
      if (String(user.id) === String(user_id)) {
        throw new PaymentError("SELF_PAYMENT", "You cannot pay yourself");
      }
      return buildUserProfile(user);
    }
    throw new PaymentError("VALIDATION", "Provide a QR payload, merchant id, or phone number");
  } catch (err) {
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Compliance + fraud
// ---------------------------------------------------------------------------

/**
 * KYC gate: above kyc_threshold a verified, non-expired Driving License is
 * required before a P2P send (reuses the existing UserProof system).
 */
const assertKycSatisfied = async function (user_id, amount) {
  if (amount < (PAY.kyc_threshold || 0)) return;

  const proofType = await ProofType.findOne({
    where: { proof_name: PAY.kyc_required_proof_type, status: "active" },
  });
  if (!proofType) {
    // Mis-config should not silently allow payments through the gate.
    throw new PaymentError("KYC_REQUIRED", `${PAY.kyc_required_proof_type} verification is required to continue`);
  }

  const proof = await UserProof.findOne({
    where: {
      user_id,
      proof_type_id: proofType.id,
      is_verified: true,
      status: "active",
    },
  });

  const expired = proof && proof.expiredAt && new Date(proof.expiredAt).getTime() < Date.now();
  if (!proof || expired) {
    throw new PaymentError(
      "KYC_REQUIRED",
      `Please upload and verify your ${PAY.kyc_required_proof_type} to continue`,
      { proof_type_id: proofType.id, proof_type_name: proofType.proof_name, expired: !!expired }
    );
  }
};

const runFraudChecks = async function (user_id, amount) {
  if (isNaN(amount) || amount <= 0) {
    throw new PaymentError("VALIDATION", "Enter a valid amount");
  }
  if (amount < PAY.min_amount) {
    throw new PaymentError("AMOUNT_TOO_LOW", `Minimum amount is ${PAY.currency} ${PAY.min_amount}`);
  }
  if (amount > PAY.max_amount) {
    throw new PaymentError("AMOUNT_TOO_HIGH", `Maximum amount is ${PAY.currency} ${PAY.max_amount}`);
  }

  // Velocity: too many attempts in the last minute.
  const since = new Date(Date.now() - 60 * 1000);
  const recentCount = await PaymentIntent.count({
    where: { initiator_user_id: user_id, createdAt: { [Op.gte]: since } },
  });
  if (recentCount >= (PAY.velocity_max_txn_per_min || 3)) {
    throw new PaymentError("VELOCITY_EXCEEDED", "Too many payment attempts. Please wait a moment and try again.");
  }

  // Daily send limit on succeeded payments.
  const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sentToday = await PaymentIntent.sum("total", {
    where: { initiator_user_id: user_id, status: "succeeded", createdAt: { [Op.gte]: dayStart } },
  });
  if ((sentToday || 0) + amount > PAY.daily_send_limit) {
    throw new PaymentError("DAILY_LIMIT_EXCEEDED", "This payment exceeds your daily sending limit.");
  }
};

// ---------------------------------------------------------------------------
// Create / Confirm / Cancel / Status
// ---------------------------------------------------------------------------

const createPayment = async function (data, user_id) {
  try {
    const { idempotency_key } = data;
    if (!idempotency_key) throw new PaymentError("VALIDATION", "idempotency_key is required");

    // Idempotent: return the existing intent for a repeated key.
    const existing = await PaymentIntent.findOne({ where: { idempotency_key } });
    if (existing) return existing.toJSON();

    // Resolve payee.
    let recipient;
    if (data.payload) recipient = await decodeQrPayload({ payload: data.payload });
    else recipient = await lookupRecipient(data, user_id);

    const type = recipient.type; // 'p2p' | 'p2b'
    const amount = round2(data.amount);
    const note = (data.note || "").toString().slice(0, PAY.note_max_length || 50);

    if (type === "p2p" && String(recipient.user_id) === String(user_id)) {
      throw new PaymentError("SELF_PAYMENT", "You cannot pay yourself");
    }

    await runFraudChecks(user_id, amount);
    if (type === "p2p") await assertKycSatisfied(user_id, amount);

    const fee = computeFee(type, amount);
    const total = round2(amount + fee);
    const biometric_required = total >= (PAY.biometric_threshold || Infinity);

    const intent = await PaymentIntent.create({
      idempotency_key,
      initiator_user_id: user_id,
      payee_user_id: type === "p2p" ? recipient.user_id : null,
      payee_store_id: type === "p2b" ? recipient.store_id : null,
      type,
      amount,
      fee,
      total,
      currency: PAY.currency,
      status: "created",
      biometric_required,
      qr_session_id: recipient.session_id || null,
      note: note || null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return Object.assign(intent.toJSON(), { recipient });
  } catch (err) {
    throw err;
  }
};

const confirmPayment = async function (data, user_id) {
  const { payment_intent_id, idempotency_key, biometric_verified } = data;

  const intent = await PaymentIntent.findOne({
    where: {
      id: payment_intent_id,
      ...(idempotency_key ? { idempotency_key } : {}),
      initiator_user_id: user_id,
    },
  });
  if (!intent) throw new PaymentError("INTENT_NOT_FOUND", "Payment not found");

  // Idempotent confirm.
  if (intent.status === "succeeded") return intent.toJSON();
  if (intent.status !== "created") {
    throw new PaymentError("INTENT_NOT_PAYABLE", `Payment cannot be completed (status: ${intent.status})`);
  }
  if (intent.expiresAt && new Date(intent.expiresAt).getTime() < Date.now()) {
    await intent.update({ status: "expired" });
    throw new PaymentError("INTENT_EXPIRED", "This payment session has expired. Please start again.");
  }
  if (intent.biometric_required && !biometric_verified) {
    throw new PaymentError("BIOMETRIC_REQUIRED", "Biometric authentication is required for this payment");
  }

  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    // Request locking / double-charge guard: re-read under row lock.
    const locked = await PaymentIntent.findOne({
      where: { id: intent.id },
      transaction: __SQL_TRANSACTION,
      lock: __SQL_TRANSACTION.LOCK.UPDATE,
    });
    if (locked.status !== "created") {
      await __SQL_TRANSACTION.rollback();
      if (locked.status === "succeeded") return locked.toJSON();
      throw new PaymentError("INTENT_NOT_PAYABLE", "Payment already processed");
    }

    const walletService = await getWalletPaymentService();

    // Sender balance check.
    const senderBalance = await CommonController.getUserCurrentBalance(user_id);
    if (senderBalance < intent.total) {
      throw new PaymentError("INSUFFICIENT_BALANCE", "Insufficient wallet balance");
    }

    // --- Debit sender ---
    const sendType = intent.type === "p2b" ? "p2b_payment" : "p2p_send";
    const __SEND_TXN = await Transaction.create(
      {
        payment_service_id: walletService.id,
        transaction_type: sendType,
        transaction_amount: intent.total,
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );

    const senderNewBalance = round2(senderBalance - intent.total);
    await UserWalletTransactions.create(
      {
        user_id: user_id,
        transaction_id: __SEND_TXN.id,
        net_balance: senderNewBalance === 0 ? 0 : senderNewBalance,
        status: "active",
      },
      { transaction: __SQL_TRANSACTION }
    );
    await CommonController.updateUserBalance(
      user_id,
      senderNewBalance === 0 ? 0 : senderNewBalance,
      __SQL_TRANSACTION
    );

    // --- Credit payee ---
    if (intent.type === "p2p") {
      const recipientBalance = await CommonController.getUserCurrentBalance(intent.payee_user_id);
      const recipientNewBalance = round2(recipientBalance + intent.amount);
      const __RECV_TXN = await Transaction.create(
        {
          payment_service_id: walletService.id,
          transaction_type: "p2p_receive",
          transaction_amount: intent.amount,
          status: "active",
        },
        { transaction: __SQL_TRANSACTION }
      );
      await UserWalletTransactions.create(
        {
          user_id: intent.payee_user_id,
          transaction_id: __RECV_TXN.id,
          net_balance: recipientNewBalance === 0 ? 0 : recipientNewBalance,
          status: "active",
        },
        { transaction: __SQL_TRANSACTION }
      );
      await CommonController.updateUserBalance(
        intent.payee_user_id,
        recipientNewBalance === 0 ? 0 : recipientNewBalance,
        __SQL_TRANSACTION
      );
    } else {
      const storeBalance = await CommonController.getStoreBalance(intent.payee_store_id);
      const storeNewBalance = round2(storeBalance + intent.amount);
      await StoreWalletTransaction.create(
        {
          store_id: intent.payee_store_id,
          transaction_id: __SEND_TXN.id,
          net_balance: storeNewBalance === 0 ? 0 : storeNewBalance,
          status: "active",
        },
        { transaction: __SQL_TRANSACTION }
      );
      await CommonController.updateStoreBalance(
        intent.payee_store_id,
        storeNewBalance === 0 ? 0 : storeNewBalance,
        __SQL_TRANSACTION
      );
    }

    await locked.update(
      { status: "succeeded", transaction_id: __SEND_TXN.id },
      { transaction: __SQL_TRANSACTION }
    );

    await __SQL_TRANSACTION.commit();

    const fresh = await PaymentIntent.findOne({ where: { id: intent.id } });
    return Object.assign(fresh.toJSON(), {
      wallet_balance: senderNewBalance === 0 ? 0 : senderNewBalance,
    });
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    await PaymentIntent.update(
      { status: "failed", failure_reason: err.code || err.message || "Payment failed" },
      { where: { id: intent.id, status: "created" } }
    ).catch(() => {});
    throw err;
  }
};

const cancelPayment = async function (data, user_id) {
  const intent = await PaymentIntent.findOne({
    where: { id: data.payment_intent_id, initiator_user_id: user_id },
  });
  if (!intent) throw new PaymentError("INTENT_NOT_FOUND", "Payment not found");
  if (intent.status === "succeeded") {
    throw new PaymentError("INTENT_NOT_PAYABLE", "Completed payments cannot be cancelled");
  }
  if (intent.status === "created") await intent.update({ status: "cancelled" });
  return intent.toJSON();
};

const getPaymentStatus = async function (data, user_id) {
  const intent = await PaymentIntent.findOne({
    where: { id: data.payment_intent_id, initiator_user_id: user_id },
  });
  if (!intent) throw new PaymentError("INTENT_NOT_FOUND", "Payment not found");
  return intent.toJSON();
};

module.exports = {
  PaymentError,
  lookupRecipient,
  generateQrPayload,
  decodeQrPayload,
  assertKycSatisfied,
  runFraudChecks,
  createPayment,
  confirmPayment,
  cancelPayment,
  getPaymentStatus,
};
