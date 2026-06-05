const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { userAuth } = require("../controllers/auth.controller");
const { createUser, generateOTP, verifyOTP, saveUserIdentityDetails, saveFavouriteStore, removeFavouriteStore, getUserDetials, updateUserDetails, createFavouriteProduct, removeFavouriteProduct, allowUserStoreAccess, deleteUser, logoutUser } = require("../controllers/user.controller");
const logger = require("../logger/logger");
const { USER_SUCCESSFULLY_CREATED, OTP_SUCCESSFULLY_SEND, LOGIN_SUCCESSFULLY, USER_PROOF_STORED_SUCCESSFULLY, USER_FAVOURITE_STORE_ADDED_SUCCESSFULLY, FAVOURITE_STORE_REMOVED_SUCCESSFULLY } = require("../utils/messages.util");
const { sendCreatedResponse, sendConflictResponse, sendUnauthorizedResponse, sendOkResponse, sendNoContentResponse } = require("../utils/response.util");
const { userCreateValidator, verifyOTPValidator, generateOTPValidator, createUserProofValidator, createFavouriteStoreValidator, removeFavouriteStoreValidator } = require("../validators/user.validators");
const { createStripeUser, createUserStripeCard, userWalletRechargeWithCard, listUserCards, deleteUserStripeCard, createUserStripeBankAccount, listUserBankAccounts, deleteUserBankAccount, getUserStripeConnectedAccount, stripeDocumentUpload, createUserWalletRechargeWithApplePayOrGooglePay } = require("../controllers/stripe.controller");
const { listUserTransactionHistories, getUserTransaction, getUserWalletAutoChargeService, createUserWalletAutoChargeService, updateUserWalletAutoChargeService, deleteUserWalletAutoChargeService, createMembership, listUserMemberships, getUserMembershipDetails } = require("../controllers/transaction.controller");
const { getUserCurrentBalance } = require("../controllers/common.controller");
const { user_listStoreReports } = require("../controllers/report.controller");
const { lookupRecipient, generateQrPayload, decodeQrPayload, createPayment, confirmPayment, cancelPayment, getPaymentStatus } = require("../controllers/payment.controller");
const { recipientLookupValidator, qrGenerateValidator, qrDecodeValidator, createPaymentValidator, confirmPaymentValidator, paymentIntentIdBodyValidator, paymentStatusValidator } = require("../validators/payment.validator");


const router = express.Router();

/**
 * Send a payment error to the client. Typed PaymentErrors carry a machine-readable
 * `code` (+ optional data) so the app can react (e.g. KYC_REQUIRED -> license upload,
 * QR_EXPIRED -> rescan). Everything else falls back to the standard conflict response.
 */
const sendPaymentError = function (res, err) {
  if (err && err.isPaymentError) {
    return res.status(409).send({
      status: 409,
      code: err.code,
      message: err.message,
      errors: [err.message],
      data: err.data || {},
    });
  }
  return sendConflictResponse(res, {}, err);
};


router.post('/create', userCreateValidator, async function(req, res){
    // logger.log("Create user request")
    try{
        const user = await createUser(req.body);
        sendCreatedResponse(res, user, USER_SUCCESSFULLY_CREATED)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});


router.post('/otp/generate', generateOTPValidator, async function(req, res){
    try{
        const otp = await generateOTP(req.body);
        sendCreatedResponse(res, otp, OTP_SUCCESSFULLY_GENERATED)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/otp/verify', verifyOTPValidator, async function(req, res){
    // logger.log("Otp verify request")
    try{
        const token = await verifyOTP(req.body);
        sendCreatedResponse(res, {token: token}, OTP_SUCCESSFULLY_VERIFIED)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/logout', userAuth, async function(req, res) {
    try{
        const logout = await logoutUser(req.payload.user.id);
        sendOkResponse(res, logout, "Account logout successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/details', userAuth, async function(req, res) {
    try{
        const user = req.payload.user;
        const __USER = await getUserDetials(user.id);
        sendOkResponse(res, __USER, "User detail successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.put('/details/update', userAuth, async function(req, res) {
    try{
        const user = req.payload.user;
        const __USER_UPDATE_DETAILS = await updateUserDetails(req.body, user.id);
        sendOkResponse(res, {}, "User details successfully updated")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/store/access/create', userAuth, async function(req, res) {
    try{
        const updateStoreAccess = await allowUserStoreAccess( req.body, req.payload.user.id);
        sendOkResponse(res, updateStoreAccess, "Store access is now allowed for the user")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.delete('/delete', userAuth, async function(req, res) {
    try{
        const deletedUser = await deleteUser(req.payload.user.id);
        sendOkResponse(res, {}, "User successfully deleted")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/proof/verification/create', userAuth, createUserProofValidator, async function(req, res) {
    // logger.log("User Proof Verification Create");
    try{
        const user = req.payload.user;
        const is_verified = process.env.NODE_ENV == 'local' || process.env.NODE_ENV == 'staging';
        const userProof = await saveUserIdentityDetails(req.body, user.id, is_verified);
        sendCreatedResponse(res, userProof, USER_PROOF_STORED_SUCCESSFULLY)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/store/favourite/create', userAuth, createFavouriteStoreValidator, async function(req, res) {
    // logger.log("User Favourite Store Create");
    try{
        const user = req.payload.user;
        const favouriteStore = await saveFavouriteStore(req.body, user.id);
        sendCreatedResponse(res, favouriteStore, USER_FAVOURITE_STORE_ADDED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.delete('/store/favourite/remove', userAuth, removeFavouriteStoreValidator, async function(req, res) {
    // logger.log("User Favourite Store Remove");
    try{
        const user = req.payload.user;
        const removeFavStore = await removeFavouriteStore(req.body, user.id);
        sendOkResponse(res, removeFavStore, FAVOURITE_STORE_REMOVED_SUCCESSFULLY);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});







router.post('/product/favourite/create', userAuth, async function(req, res) {
    try{
        const user_id = req.payload.user.id;
        const favouriteProduct = await createFavouriteProduct(req.body.product_id, user_id);
        sendCreatedResponse(res, favouriteProduct, "Product added to favorites successfully!");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
});






router.delete('/product/favourite/delete', userAuth, async function(req, res) {
    try{
        const user_id = req.payload.user.id;
        const deleteFavProduct = await removeFavouriteProduct(req.body.product_id, user_id);
        sendOkResponse(res, deleteFavProduct, "Product removed from favorites successfully!")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})









router.post('/stripe/customer/create', userAuth, async function(req, res) {
    try{
        const stripeUser = await createStripeUser(req.body, req.payload.user.id);
        sendCreatedResponse(res, stripeUser, "Stripe user successfully created");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/wallet/recharge/stripe', userAuth, async function(req, res) {
    try{
        const paymentIntent = await userWalletRechargeWithCard(req.body, req.payload.user.id);
        sendCreatedResponse(res, paymentIntent, "Balance added to wallet successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.post('/wallet/recharge/paymentMethod', userAuth, async function(req, res) {
    try{
        const paymentIntent = await createUserWalletRechargeWithApplePayOrGooglePay(req.body, req.payload.user.id);
        sendCreatedResponse(res, paymentIntent, "Balance added to wallet successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/wallet/transactions/list', userAuth, async function(req, res) {
    try{
        const transactions = await listUserTransactionHistories(req.query, req.payload.user.id);
        sendOkResponse(res, transactions, "Tranasaction list successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/wallet/transaction/details', userAuth, async function(req, res) {
    try{
        const transaction = await getUserTransaction(req.query, req.payload.user.id);
        sendOkResponse(res, transaction, "Tranasaction successfully fetched")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.get('/wallet/balance', userAuth, async function(req, res) {
    try{
        const balance = await getUserCurrentBalance(req.payload.user.id);
        sendOkResponse(res, {balance}, "Balance successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.get('/wallet/autocharge/details', userAuth, async function(req, res) {
    try{
        const autoCharge = await getUserWalletAutoChargeService(req.payload.user.id);
        sendOkResponse(res, autoCharge, "User wallet auto charge details fetched successfully")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.post('/wallet/autocharge/create', userAuth, async function(req, res) {
    try{
        const autoCharge = await createUserWalletAutoChargeService(req.body, req.payload.user.id);
        sendOkResponse(res, autoCharge, "Auto charge service activated")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.put('/wallet/autocharge/update', userAuth, async function(req, res) {
    try{
        const autoCharge = await updateUserWalletAutoChargeService(req.body, req.payload.user.id);
        sendOkResponse(res, autoCharge, "Service update for auto charge")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.delete('/wallet/autocharge/delete', userAuth, async function(req, res) {
    try{
        const autoCharge = await deleteUserWalletAutoChargeService(req.body, req.payload.user.id);
        sendOkResponse(res, autoCharge, "The auto charge service has been removed")
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})










router.post('/stripe/card/create', userAuth, async function(req, res) {
    try{
        const stripeUser = await createUserStripeCard(req.body, req.payload.user.id);
        sendCreatedResponse(res, stripeUser, "Card added successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.get('/stripe/card/list', userAuth, async function(req, res) {
    try{
        const stripeCards = await listUserCards(req.payload.user.id);
        sendOkResponse(res, stripeCards, "Cards successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.delete('/stripe/card/delete', userAuth, async function(req, res) {
    try{
        const deleteCard = await deleteUserStripeCard(req.body, req.payload.user.id);
        sendOkResponse(res, deleteCard, "Card deleted successfully");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/stripe/bank/create', userAuth, async function(req, res) {
    try{
        const stripeUser = await createUserStripeBankAccount(req.body, req.payload.user.id);
        sendCreatedResponse(res, stripeUser, "Bank successfully added");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/stripe/bank/list', userAuth, async function(req, res) {
    try{
        const stripeCards = await listUserBankAccounts(req.payload.user.id);
        sendOkResponse(res, stripeCards, "Bank list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.delete('/stripe/bank/delete', userAuth, async function(req, res) {
    try{
        const deleteCard = await deleteUserBankAccount(req.body, req.payload.user.id);
        sendOkResponse(res, deleteCard, "Bank successfully removed");
    }catch(err){
        sendConflictResponse(res, {}, err);
    }
})


router.get('/stripe/connected/account/details', userAuth, async function(req, res) {
    try{
        const stripeConnectedAccount = await getUserStripeConnectedAccount(req.payload.user.id)
        sendOkResponse(res, stripeConnectedAccount, "Account details successfully fetched");
    }catch(err){
        sendConflictResponse(res, {}, err);
    }
})



router.post('/stripe/document/upload', userAuth, upload.single('file'), async function(req, res) {
    try{
        const file = await stripeDocumentUpload(req.file, req.body.file_type);
        sendOkResponse(res, file, "File successfully created");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





router.post('/membership/create', userAuth, async function(req, res) {
    try{
        const membership = await createMembership(req.body, req.payload.user.id);
        sendCreatedResponse(res, membership, "Membership successfully added");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




router.get('/membership/list', userAuth, async function(req, res) {
    try{
        const memberships = await listUserMemberships(req.query, req.payload.user.id);
        sendCreatedResponse(res, memberships, "Membership list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.get('/membership/details', userAuth, async function(req, res) {
    try{
        const membership = await getUserMembershipDetails(req.query, req.payload.user.id);
        sendCreatedResponse(res, membership, "Membership details successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})



router.get('/reports/store', userAuth, async function(req, res) {
    try{
        const report = await user_listStoreReports(req.query, req.payload.user.id);
        sendCreatedResponse(res, report, "Report successfully send");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})


router.get('/reports/store/transactions', userAuth, async function(req, res) {
    try{
        const report = await user_listStoreTransactions(req.body, req.payload.user.id);
        sendCreatedResponse(res, report, "Report successfully send");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})




// ---------------------------------------------------------------------------
// P2P & P2B Barcode Payments
// ---------------------------------------------------------------------------

router.post('/payment/recipient/lookup', userAuth, recipientLookupValidator, async function(req, res) {
    try{
        const recipient = await lookupRecipient(req.body, req.payload.user.id);
        sendOkResponse(res, recipient, "Recipient fetched successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.post('/payment/qr/generate', userAuth, qrGenerateValidator, async function(req, res) {
    try{
        const qr = await generateQrPayload(req.body, req.payload.user.id);
        sendOkResponse(res, qr, "Payment code generated successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.post('/payment/qr/decode', userAuth, qrDecodeValidator, async function(req, res) {
    try{
        const decoded = await decodeQrPayload(req.body);
        sendOkResponse(res, decoded, "Payment code decoded successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.post('/payment/create', userAuth, createPaymentValidator, async function(req, res) {
    try{
        const intent = await createPayment(req.body, req.payload.user.id);
        sendCreatedResponse(res, intent, "Payment created successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.post('/payment/confirm', userAuth, confirmPaymentValidator, async function(req, res) {
    try{
        const result = await confirmPayment(req.body, req.payload.user.id);
        sendOkResponse(res, result, "Payment completed successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.post('/payment/cancel', userAuth, paymentIntentIdBodyValidator, async function(req, res) {
    try{
        const result = await cancelPayment(req.body, req.payload.user.id);
        sendOkResponse(res, result, "Payment cancelled");
    }catch(err) {
        sendPaymentError(res, err);
    }
})

router.get('/payment/status', userAuth, paymentStatusValidator, async function(req, res) {
    try{
        const result = await getPaymentStatus(req.query, req.payload.user.id);
        sendOkResponse(res, result, "Payment status fetched successfully");
    }catch(err) {
        sendPaymentError(res, err);
    }
})


module.exports = {userRouter: router}
