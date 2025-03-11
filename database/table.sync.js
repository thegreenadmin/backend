const Admin = require("./../models/admin/admin.model")
const Controller = require("./../models/module/controller.model")
const Module = require("./../models/module/module.model")
const ProofType = require("./../models/proof/proof_type.model")
const FavouriteStore = require("./../models/store/favourite_stores.model")
const Permission = require("./../models/store/permission.model")
const Role = require("./../models/store/role.model")
const Store = require("./../models/store/store.model")
const StoreUser = require("./../models/store/store_users.model")
const User = require("./../models/user/user.model")
const UserOTP = require("./../models/user/user_otp.model")
const UserProof = require("./../models/user/user_proof.model")
const UserSession = require("./../models/user/user_sessions.model")
const Country = require('./../models/state/country.model');
const State = require('./../models/state/state.model');
const UserAddress = require('./../models/user/user_address.model');
const StoreAddress = require('./../models/store/store_address.model');
const Category = require('./../models/catalogue/category.model');
const QuantityType = require('./../models/catalogue/quantity_type.model');
const Product = require('./../models/catalogue/product.model');
const ProductCategory = require('./../models/catalogue/product_category.model');
const ProductImage = require('./../models/catalogue/product_image.model');
const ProductContent = require('./../models/catalogue/product_content.model');
const ProductLink = require('./../models/catalogue/product_link.model');
const StoreTiming = require("../models/store/store_timings.model")
const StoreUserTiming = require("../models/store/store_user_timing.model")
const Offer = require("../models/offer/offer.model")
const OfferProduct = require("../models/offer/offer_product.model")
const FavouriteProduct = require("../models/catalogue/favourite_product.model")
const CartItem = require("../models/cart/cart_item.model")
const DeliveryService = require("../models/delivery/delivery_service.model")
const StoreDeliveryService = require("../models/delivery/store_delivery_service.model")
const OrderServiceCharge = require("../models/order/order_service_charge.model")
const Order = require("../models/order/order.model")
const OrderStatus = require("../models/order/order_status.model")
const OrderItem = require("../models/order/order_item.model")
const OrderDeliveryAddress = require("../models/order/order_delivery_address.model")
const PaymentService = require("../models/transaction/payment_service.model")
const Transaction = require("../models/transaction/transaction.model")
const TransactionHistory = require("../models/transaction/transaction_history.model")
const OrderTransaction = require("../models/transaction/order_transaction.model")
const OrderItemRefundTransaction = require("../models/transaction/order_item_refund_transaction.model")
const StorePayout = require("../models/transaction/store_payout.model")
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model")
const OrderHistory = require("../models/order/order_history.model")
const ReturnOrderItem = require("../models/order/return_order_item.model")
const ReturnOrderItemHistory = require("../models/order/return_order_item_history.model")
const ReturnOrderItemStatus = require("../models/order/return_order_item_status.model")
const ProductReview = require("../models/catalogue/product_review.model")
const OrderNotification = require("../models/notification/order_history_notification.model")
const MessageHead = require("../models/message/message_head.model")
const Message = require("../models/message/message.model")
const UserStripe = require("../models/user/user_stripe.model")
const UserStripeCard = require("../models/user/user_stripe_card.model")
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model")
const StoreStripeAccount = require("../models/store/store_stripe_account.model")
const StoreStripeBankAccount = require("../models/store/store_stripe_bank_account.model")
const StoreServiceCharge = require("../models/store/store_service_charge.model")
const Notification = require("../models/notification/notification.model")
const NotificationSetting = require("../models/notification/notification_setting.model")
const StoreTransfer = require("../models/transaction/store_transfer.model")
const BlockUser = require("../models/user/block_user.model")
const PageType = require("../models/page/page_type.model")
const Page = require("../models/page/page.model")
const ContactQuery = require("../models/contact/contact_query.model")
const UserStripeBank = require("../models/user/user_stripe_bank.model")
const ClaimStore = require("../models/store/claim_store.model")
const StorePage = require("../models/store/store_page.model")
const UserWalletAutoCharge = require("../models/transaction/user_wallet_auto_charge.model")
const ProductVisitor = require("../models/catalogue/product_visitor.model")
const StoreVisitor = require("../models/store/store_visitor.model")
const AdminNotification = require("../models/notification/admin_notification.model")
const AdminForgotPassword = require("../models/admin/admin_forgot_password.model")
const Membership = require("../models/transaction/membership.model")
const MembershipPlan = require("../models/transaction/membership_plan.model")
const PreviousStore = require("../models/store/previous_store.model")
const PreviousProduct = require("../models/catalogue/previous_product.model")
const Tax = require("../models/tax/tax.model")
const DefaultRole = require("../models/module/default_role.model")
const DefaultPermission = require("../models/module/default_permission.model")


const syncTables = async function () {
    try {
        //developer
        await Module.sync({ force: false })
        await Controller.sync({ force: false })
        await DefaultRole.sync({force: false})
        await DefaultPermission.sync({force: false})

        //utils
        await Country.sync({ force: false });
        await State.sync({ force: false });

        //page
        await Page.sync({force: false})

        //admin
        await Admin.sync({ force: false })
        await ProofType.sync({ force: false })
        await QuantityType.sync({ force: false })
        await DeliveryService.sync({ force: false })
        await OrderServiceCharge.sync({force: false})
        await OrderStatus.sync({force: false})
        await PaymentService.sync({force: false})
        await AdminForgotPassword.sync({force: false})
        await MembershipPlan.sync({force: false})
        await Tax.sync({force: false})


        //user
        await User.sync({ force: false })
        await BlockUser.sync({force: false})
        await UserOTP.sync({ force: false })
        await UserSession.sync({ force: false })
        await UserProof.sync({ force: false })
        await UserAddress.sync({ force: false })
        
        //store
        await Store.sync({ force: false })
        await StoreServiceCharge.sync({force: false})
        await StoreTiming.sync({ force: false })
        await StoreAddress.sync({ force: false })
        await Role.sync({ force: false })
        await StoreUser.sync({ force: false })
        await FavouriteStore.sync({ force: false })
        await StoreUserTiming.sync({ force: false })
        await Permission.sync({ force: false })
        await StoreDeliveryService.sync({force: false})
        await StorePage.sync({force: false})
        await StoreStripeAccount.sync({force: false})

        //cataloge
        await Category.sync({ force: false })
        await Product.sync({ force: false })
        await ProductCategory.sync({ force: false })
        await ProductImage.sync({ force: false })
        await ProductContent.sync({ force: false })
        await ProductLink.sync({ force: false })
        await FavouriteProduct.sync({ force: false })

        //visitors
        await ProductVisitor.sync({force: false})
        await StoreVisitor.sync({force: false})
        await PreviousStore.sync({force: false});
        await PreviousProduct.sync({force: false})

        //offer
        await Offer.sync({ force: false })
        await OfferProduct.sync({ force: false })

        //cart
        await CartItem.sync({ force: false })

        //order
        await Order.sync({force: false})
        await OrderItem.sync({force: false})
        await OrderDeliveryAddress.sync({force: false})
        await OrderHistory.sync({force: false})
        await ProductReview.sync({force: false})

        // order item return
        await ReturnOrderItem.sync({force: false})
        

        //Stripe
        await UserStripe.sync({force: false})
        await UserStripeCard.sync({force: false})
        await UserStripeBank.sync({force: false})


        //transaction
        await Transaction.sync({force: false})
        await TransactionHistory.sync({force: false})
        await OrderTransaction.sync({force: false})
        await OrderItemRefundTransaction.sync({force: false})
        await UserWalletAutoCharge.sync({force: false})

        // membership
        await Membership.sync({force: false})
        await UserWalletTransactions.sync({force: false})
        await StorePayout.sync({force: false})
        await StoreWalletTransaction.sync({force: false})

        // messages
        await MessageHead.sync({force: false});
        await Message.sync({force: false});

        //contact
        await ContactQuery.sync({force: false})

        //claim
        await ClaimStore.sync({force: false})

        //notficaiton
        await Notification.sync({force: false})
        await NotificationSetting.sync({force: false})
        await AdminNotification.sync({force: false})


    } catch (err) {
        throw err;
    }
}

module.exports = syncTables;