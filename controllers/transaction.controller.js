const sequelize = global['sequelize'];
const moment = require('moment');

const { Op } = require("sequelize");
const logger = require("../logger/logger");
const OrderNotification = require("../models/notification/order_history_notification.model");
const Order = require("../models/order/order.model");
const OrderHistory = require("../models/order/order_history.model");
const OrderItem = require("../models/order/order_item.model");
const OrderStatus = require("../models/order/order_status.model");
const ReturnOrderItem = require("../models/order/return_order_item.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const StoreUser = require("../models/store/store_users.model");
const OrderItemRefundTransaction = require("../models/transaction/order_item_refund_transaction.model");
const OrderTransaction = require("../models/transaction/order_transaction.model");
const PaymentService = require("../models/transaction/payment_service.model");
const StorePayout = require("../models/transaction/store_payout.model");
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model");
const Transaction = require("../models/transaction/transaction.model");
const TransactionHistory = require("../models/transaction/transaction_history.model");
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");
const Notification = require("../models/notification/notification.model");
const StoreTransfer = require("../models/transaction/store_transfer.model");
const UserWalletAutoCharge = require("../models/transaction/user_wallet_auto_charge.model");
const UserStripeCard = require("../models/user/user_stripe_card.model");
const UserStripe = require("../models/user/user_stripe.model");
const MembershipPlan = require("../models/transaction/membership_plan.model");
const Membership = require("../models/transaction/membership.model");
const User = require('../models/user/user.model');








const getUserWalletPaymentService = async function() {
    try{
        const __WALLET_SERVICE = await PaymentService.findOne({
            where: {
                payment_service_name: {[Op.iLike]: 'user wallet'},
                is_enabled: true, 
                status: 'active'
            }
        })
        if(!__WALLET_SERVICE) {
            throw "Wallet transactions are down";
        }
        return __WALLET_SERVICE.toJSON()
    }catch(err) {
        throw err;
    }
}


const getStoreWalletPaymentService = async function() {
    try{
        const __WALLET_SERVICE = await PaymentService.findOne({
            where: {
                payment_service_name: {[Op.iLike]: 'store wallet'},
                is_enabled: true, 
                status: 'active'
            }
        })
        if(!__WALLET_SERVICE) {
            throw "Wallet transactions are down";
        }
        return __WALLET_SERVICE.toJSON()
    }catch(err) {
        throw err;
    }
}


const createOrderTransaction = async function(order, user, __SQL_TRANSACTION) {
    try{
        const __WALLET_SERVICE = await getUserWalletPaymentService();
        // todo: create code for check user has enough balance
        const __USER_BALANCE = await CommonController.getUserCurrentBalance(user.id);
        console.log("order.total_amount=",order.total_amount)
        console.log("__USER_BALANCE=",__USER_BALANCE)
        if(__USER_BALANCE < order.total_amount) {
            throw "Insufficient balance"
        }
        // create transaction
        const __TRANSACTION = await Transaction.create({
            payment_service_id: __WALLET_SERVICE.id,
            transaction_type: 'order',
            transaction_amount: order.total_amount,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        const __STORE_SERVICE_CHARGE = await CommonController.getStoreServiceCharge(order.store_id);
        const totalStoreServiceCharge = CommonController.getCalculateOffset( (order.total_amount /*- order.total_tax_charged */- order.total_service_charged), __STORE_SERVICE_CHARGE.service_charge_type, __STORE_SERVICE_CHARGE.service_charge_value )
        console.log("totalStoreServiceCharge",totalStoreServiceCharge)
        
        // create order transaction
        const __ORDER_TRANSACTION = await OrderTransaction.create({
            transaction_id: __TRANSACTION.id,
            order_id: order.id,
            status: 'active',
            order_transaction_type: 'order',
            store_service_charge_type: __STORE_SERVICE_CHARGE.service_charge_type,
            store_service_charge_value: __STORE_SERVICE_CHARGE.service_charge_value,
            store_total_service_charged: totalStoreServiceCharge,
            order_service_charge_type: order.service_charge_type,
            order_service_charge_value: order.service_charge_value,
            order_total_service_charged: order.total_service_charged,
            store_received_amount: order.total_amount - totalStoreServiceCharge  - order.total_service_charged, 
            total_amount: order.total_amount
        },{
            transaction: __SQL_TRANSACTION
        })


        const newUserBalance = __USER_BALANCE - order.total_amount;
        console.log("newUserBalance=",newUserBalance)

        const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create({
            user_id: user.id,
            order_transcation_id: __ORDER_TRANSACTION.id,
            net_balance: newUserBalance.toFixed(2) == 0 ? 0 : newUserBalance,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        await CommonController.updateUserBalance(user.id, newUserBalance.toFixed(2) == 0 ? 0 : newUserBalance, __SQL_TRANSACTION);

        return __ORDER_TRANSACTION.toJSON()
        
    }catch(err) {
        throw err;
    }
}



const confirmOrderTransaction = async function(orderTransaction, order, orderItems, store_id, __SQL_TRANSACTION) {
    try{

        const __STORE_BALANCE = await CommonController.getStoreBalance(store_id);

        let __TOTAL_SERVICE_CHARGE = 0.0;

        orderItems.forEach(oi => {
            __TOTAL_SERVICE_CHARGE += oi.total_service_charged;
        })

        let __STORE_WALLET_TRANASACTION;


        // __STORE_WALLET_TRANASACTION = await StoreWalletTransaction.create({
        //     store_id,
        //     order_transaction_id: orderTransaction.id,
        //     net_balance: (__STORE_BALANCE + orderTransaction.store_received_amount),
        //     status: 'active'
        // }, {
        //     transaction: __SQL_TRANSACTION
        // })

        // complete the transaction history
        const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
            transaction_id: orderTransaction.transaction_id,
            transaction_status: 'success',
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        });

        // await CommonController.updateStoreBalance(store_id, __STORE_BALANCE + orderTransaction.store_received_amount, __SQL_TRANSACTION)

        return {order_status: 'success'}

    }catch(err) {
        throw err;
    }
}





const createCancelOrderTransaction = async function(order_id, __SQL_TRANSACTION) {
    try{
        const __ORDER_TRANSACTION = await OrderTransaction.findOne({
            where : {order_id, status: 'active'},
            include: [{model: Order}, {model: Transaction, where: {transaction_type: 'order', status: 'active'}}]
        })

        const storeCurrentBalance = await CommonController.getStoreBalance(__ORDER_TRANSACTION.order.store_id);
        const userCurrentBalance = await CommonController.getUserCurrentBalance(__ORDER_TRANSACTION.order.user_id);

        const __WALLET_SERVICE = await getUserWalletPaymentService();
        // todo: create code for check user has enough balance

        // create transaction
        const __TRANSACTION = await Transaction.create({
            payment_service_id: __WALLET_SERVICE.id,
            transaction_type: 'order cancel',
            transaction_amount: __ORDER_TRANSACTION.total_amount,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })


        // create pending tranaction history
        const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
            transaction_id: __TRANSACTION.id,
            transaction_status: 'success',
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        // create order transaction
        const __NEW_ORDER_TRANSACTION = await OrderTransaction.create({
            transaction_id: __TRANSACTION.id,
            order_id,
            status: 'active',
            order_transaction_type: 'order cancel',
            store_service_charge_type: __ORDER_TRANSACTION.store_service_charge_type,
            store_service_charge_value: __ORDER_TRANSACTION.store_service_charge_value,
            store_total_service_charged: __ORDER_TRANSACTION.store_total_service_charged,
            order_service_charge_type: __ORDER_TRANSACTION.order_service_charge_type,
            order_service_charge_value: __ORDER_TRANSACTION.order_service_charge_value,
            order_total_service_charged: __ORDER_TRANSACTION.order_total_service_charged,
            store_received_amount: __ORDER_TRANSACTION.store_received_amount,
            total_amount: __ORDER_TRANSACTION.total_amount
        },{
            transaction: __SQL_TRANSACTION
        })

        const newStoreBalance = storeCurrentBalance - __ORDER_TRANSACTION.store_received_amount;
        
        // when order is cancelled

        // const __STORE_WALLET_TRANASACTION = await StoreWalletTransaction.create({
        //     store_id: __ORDER_TRANSACTION.order.store_id,
        //     order_transaction_id: __NEW_ORDER_TRANSACTION.id,
        //     net_balance: newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance,
        //     status: 'active'
        // }, {
        //     transaction: __SQL_TRANSACTION
        // })

        // await CommonController.updateStoreBalance(__ORDER_TRANSACTION.order.store_id, newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance, __SQL_TRANSACTION);

        const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create({
            user_id: __ORDER_TRANSACTION.order.user_id,
            order_transcation_id: __NEW_ORDER_TRANSACTION.id,
            net_balance: userCurrentBalance + __ORDER_TRANSACTION.total_amount,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        await CommonController.updateUserBalance(__ORDER_TRANSACTION.order.user_id, userCurrentBalance + __ORDER_TRANSACTION.total_amount, __SQL_TRANSACTION)

    }catch(err) {
        throw err;
    }
}





const createStoreOrderTransctionAndReturnBalance = async function(store_id, order_id, __SQL_TRANSACTION) {
    try{
        let currentStoreBalance = await CommonController.getStoreBalance(store_id);
        
        const __ORDER_TRANSACTION = await OrderTransaction.findOne({
            where : {order_id, status: 'active'},
            include: [{model: Order}, {model: Transaction, where: {transaction_type: 'order', status: 'active'}}]
        })

        let __STORE_WALLET_TRANASACTION;


        __STORE_WALLET_TRANASACTION = await StoreWalletTransaction.create({
            store_id,
            order_transaction_id: __ORDER_TRANSACTION.id,
            net_balance: (currentStoreBalance + __ORDER_TRANSACTION.store_received_amount),
            status: 'active'
        }, {
            transaction: __SQL_TRANSACTION
        })

        await CommonController.updateStoreBalance(store_id, currentStoreBalance + __ORDER_TRANSACTION.store_received_amount, __SQL_TRANSACTION)

        return currentStoreBalance + __ORDER_TRANSACTION.store_received_amount;
    }catch(err) {
        throw err;
    }
}




const createAndConfirmOrderItemCancelTransaction = async function(order_id, order_items = [], storeCurrentBalance = null, __SQL_TRANSACTION) {
    try{
        // change the whole code
        const whereOrderItems = order_items.length 
        ?{
            id: {[Op.in]: order_items.map(oi => oi.order_item_id)}
        } 
        :{} ;

        let __ORDER = await Order.findOne({
            where: {id: order_id, status: 'active'},
            include: [
                {
                    model: OrderItem,
                    required: false,
                    where: { ...whereOrderItems, status: 'active'}
                }
            ]
        });

        if(!__ORDER) {
            throw "Order not found"
        }

        __ORDER = __ORDER.toJSON()

        const __WALLET_SERVICE = await getUserWalletPaymentService();
        // todo: create code for check user has enough balance
        storeCurrentBalance = storeCurrentBalance != null ? storeCurrentBalance : await CommonController.getStoreBalance(__ORDER.store_id);
        let userCurrentBalance = await CommonController.getUserCurrentBalance(__ORDER.user_id);
        
        for(let i=0; i<__ORDER.order_items.length; i++) {
            const orderItem = __ORDER.order_items[i];
            const totalReverseAmount = (orderItem.order_item_price * orderItem.order_item_count) - orderItem.total_discount;
            userCurrentBalance += totalReverseAmount;
            storeCurrentBalance -= totalReverseAmount;

            // create transaction
            const __TRANSACTION = await Transaction.create({
                payment_service_id: __WALLET_SERVICE.id,
                transaction_type: 'item cancel',
                transaction_amount: totalReverseAmount,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            // create pending tranaction history
            const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
                transaction_id: __TRANSACTION.id,
                transaction_status: 'success',
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            const __ORDER_ITEM_REFUND_TRANSACTION = await OrderItemRefundTransaction.create({
                transaction_id: __TRANSACTION.id,
                order_item_id: orderItem.id,
                status: 'active'
            }, {
                transaction: __SQL_TRANSACTION
            })

            const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create({
                order_item_refund_transaction_id: __ORDER_ITEM_REFUND_TRANSACTION.id,
                user_id: __ORDER.user_id,
                net_balance: userCurrentBalance,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            await CommonController.updateUserBalance(__ORDER.user_id, userCurrentBalance, __SQL_TRANSACTION);

            const __STORE_WALLET_TRANSACTION = await StoreWalletTransaction.create({
                order_item_refund_transaction_id: __ORDER_ITEM_REFUND_TRANSACTION.id,
                store_id: __ORDER.store_id,
                net_balance: storeCurrentBalance,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            await CommonController.updateStoreBalance(__ORDER.store_id, storeCurrentBalance, __SQL_TRANSACTION);
        }

        return {refund_status: 'success'}

    }catch(err) {
        throw err;
    }
}





const createReturnOrderTransction = async function(order_id, order_items = [], __SQL_TRANSACTION) {
    try{
        const __ORDER = await Order.findOne({
            where: {id: order_id, status: 'active'},
            include: [
                {
                    model: OrderItem,
                    where: { id: {[Op.in]:order_items.map(oi => oi.id)}, status: 'active'},
                    include: [
                        {
                            model: ReturnOrderItem,
                            required: false,
                            where: {status: 'active'}
                        }
                    ]
                }
            ]
        })

        if(!__ORDER) {
            throw "Invalid order"
        }

        let __LAST_WALLET_TRANSACTION = await StoreWalletTransaction.findOne({
            where: {store_id: __ORDER.store_id, status: 'active'},
            order: [ [ 'createdAt', 'DESC' ]],
        });

        const __WALLET_SERVICE = await PaymentService.findOne({
            where: {
                payment_service_name: {[Op.iLike]: 'user wallet'},
                is_enabled: true, 
                status: 'active'
            }
        })

        let __USER_BALANCE = await CommonController.getUserCurrentBalance(__ORDER.user_id);
        
        for(let i=0; i<__ORDER.order_items.length; i++ ) {
            const orderItem = __ORDER.order_items[i];
            const returnOrderItem = orderItem.return_order_items[0];
            
            if(!returnOrderItem) {
                throw `Can not create return request as item is in '${orderItem.order_item_status}'`;
            }

            const __TRANSACTION = await Transaction.create({
                payment_service_id: __WALLET_SERVICE.id,
                transaction_type: 'refund',
                transaction_amount: returnOrderItem.total_amount_reversed,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            const __TRANSACTION_HISTORY = await TransactionHistory.create({
                transaction_id: __TRANSACTION.id,
                transaction_status: 'success',
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })


            const __ORDER_ITEM_REFUND_TRANSACTION = await OrderItemRefundTransaction.create({
                transaction_id: __TRANSACTION.id,
                order_item_id: orderItem.id,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            const newStoreBalance = __LAST_WALLET_TRANSACTION.net_balance - returnOrderItem.total_amount_reversed

            const __NEW_STORE_WALLET_TRANSACTION = await StoreWalletTransaction.create({
                store_id: __ORDER.store_id,
                order_item_refund_transaction_id: __ORDER_ITEM_REFUND_TRANSACTION.id,
                net_balance: newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            await CommonController.updateStoreBalance( __ORDER.store_id, newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance , __SQL_TRANSACTION)

            __LAST_WALLET_TRANSACTION = __NEW_STORE_WALLET_TRANSACTION;

            const __USER_WALLET_TRANSACTION = await UserWalletTransactions.create({
                user_id: __ORDER.user_id,
                order_item_refund_transaction_id: __ORDER_ITEM_REFUND_TRANSACTION.id,
                net_balance: __USER_BALANCE + returnOrderItem.total_amount_reversed,
                status: 'active'
            },{
                transaction: __SQL_TRANSACTION
            })

            await CommonController.updateUserBalance(__ORDER.user_id, __USER_BALANCE + returnOrderItem.total_amount_reversed , __SQL_TRANSACTION)

            __USER_BALANCE = __USER_BALANCE + returnOrderItem.total_amount_reversed;
        }
        
        return {is_return_order_transaction_completed: true}
    }catch(err) {
        throw err;
    }
}







//auto charge
//auto charge
//auto charge
//auto charge
//auto charge
const getUserWalletAutoChargeService = async function(user_id) {
    try{
        const __USER_WALLET_AUTO_CHARGE = await UserWalletAutoCharge.findOne({
            where: {user_id, status: 'active'},
            attributes: {
                include: [['id', 'user_wallet_auto_charge_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: UserStripeCard,
                    where: {status: 'active'},
                    attributes: []
                }
            ]
        })


        return {
            user_wallet_auto_charge: __USER_WALLET_AUTO_CHARGE
        }
    }catch(err) {
        throw err;
    }
}




const createUserWalletAutoChargeService = async function(data, user_id) {
    // data = {auto_charge_type, user_stripe_card_id, amount, frequency, day}
    try{
        let {auto_charge_type, user_stripe_card_id, threshold_amount, charge_amount, start_date, frequency, day} = data;

        if(auto_charge_type != "threshold") {
            if(!day) {
                throw "Please select day for periodic";
            }
        }

        if(frequency == 7) {
            const desiredDayOfWeek = day - 1; // 0 = Sunday, 1 = Monday, 2 = Tuesday, ...
            const today = moment().utc().isoWeekday(); // Get the current day of the week (0-6, Sunday to Saturday)
            const daysToAdd = (desiredDayOfWeek - today + 7) % 7; // Calculate the number of days to add
            const upcomingDate = moment().utc().add(daysToAdd, 'days');
            start_date = upcomingDate;
        }
        else if(frequency == 30) {
            const desiredDayOfMonth = day; // Desired day of the month
            const today = moment().utc().date(); // Get the current day of the month
            const currentMonth = moment().utc().month(); // Get the current month
            let upcomingDate;

            if (today < desiredDayOfMonth) {
                upcomingDate = moment().utc().date(desiredDayOfMonth);
            } else {
                upcomingDate = moment().utc().month(currentMonth).add(1, 'month').date(desiredDayOfMonth);
            }

            start_date = upcomingDate;
        }

        if(!start_date) {
            start_date = moment().utc()
        }

        const __IS_AUTO_CHARGE_AVAILABLE = await UserWalletAutoCharge.findOne({
            where: {user_id, status: 'active'},
            include: [
                {
                    model: UserStripeCard,
                    where: {status: 'active'}
                }
            ]
        })

        if(__IS_AUTO_CHARGE_AVAILABLE) {
            throw "Auto charge is already enabled"
        }

        const __USER_STRIPE_CARD = await UserStripeCard.findOne({
            where: {id: user_stripe_card_id},
            include: [
                {
                    model: UserStripe,
                    where: {user_id, status: 'active'}
                }
            ]
        })

        if(!__USER_STRIPE_CARD) {
            throw "Card not available"
        }


        // remove if there is deleted card auto charge service
        await UserWalletAutoCharge.update({status: 'deleted'}, {where: {user_id}});

        const __USER_WALLET_AUTO_CHARGE = await UserWalletAutoCharge.create({
            user_id, 
            user_stripe_card_id,
            auto_charge_type,
            threshold_amount: auto_charge_type == 'threshold' ? threshold_amount : null,
            charge_amount: charge_amount,
            start_date, 
            day: auto_charge_type == 'threshold' ? null: day,
            frequency: auto_charge_type == 'threshold' ? 1 : frequency,
            status: 'active'
        })


        return {user_wallet_auto_charge_id: __USER_WALLET_AUTO_CHARGE.id}

    }catch(err) {
        throw err
    }
}




const updateUserWalletAutoChargeService = async function(data, user_id) {
    // data = {user_wallet_auto_charge_id, auto_charge_type, user_stripe_card_id, threshold_amount, charge_amount, start_date, frequency, day}
    try{
        let {user_wallet_auto_charge_id, auto_charge_type, user_stripe_card_id, threshold_amount, charge_amount, start_date, frequency, day} = data;
        
        if(auto_charge_type != "threshold") {
            if(!day) {
                throw "Please select day for periodic";
            }
        }

        if(frequency == 7) {
            const desiredDayOfWeek = day - 1; // 0 = Sunday, 1 = Monday, 2 = Tuesday, ...
            const today = moment().utc().isoWeekday(); // Get the current day of the week (0-6, Sunday to Saturday)
            const daysToAdd = (desiredDayOfWeek - today + 7) % 7; // Calculate the number of days to add
            const upcomingDate = moment().utc().add(daysToAdd, 'days');
            start_date = upcomingDate;
        }
        else if(frequency == 30) {
            const desiredDayOfMonth = day; // Desired day of the month
            const today = moment().utc().date(); // Get the current day of the month
            const currentMonth = moment().utc().month(); // Get the current month
            let upcomingDate;

            if (today < desiredDayOfMonth) {
                upcomingDate = moment().utc().date(desiredDayOfMonth);
            } else {
                upcomingDate = moment().utc().month(currentMonth).add(1, 'month').date(desiredDayOfMonth);
            }

            start_date = upcomingDate;
        }

        if(!start_date) {
            start_date = moment().utc()
        }
        
        const __USER_STRIPE_CARD = await UserStripeCard.findOne({
            where: {id: user_stripe_card_id},
            include: [
                {
                    model: UserStripe,
                    where: {user_id, status: 'active'}
                }
            ]
        })

        if(!__USER_STRIPE_CARD) {
            throw "Card not available"
        }

        const __USER_WALLET_AUTO_CHARGE = await UserWalletAutoCharge.update({
            user_id, 
            user_stripe_card_id,
            auto_charge_type,
            threshold_amount: auto_charge_type == 'threshold' ? threshold_amount : null,
            charge_amount: charge_amount,
            start_date, 
            day: auto_charge_type == 'threshold' ? null: day,
            frequency: auto_charge_type == 'threshold' ? 1 : frequency,
            status: 'active'
        },{
            where: {id: user_wallet_auto_charge_id}
        })

        return {
            is_updated: true
        }
    }catch(err) {
        throw err;
    }
}




const deleteUserWalletAutoChargeService = async function(data, user_id) {
    // data = {user_wallet_auto_charge_id}
    try{
        const {user_wallet_auto_charge_id} = data;

        const __USER_WALLET_AUTO_CHARGE_SERVICE = await UserWalletAutoCharge.findOne({
            where: {id: user_wallet_auto_charge_id}
        }) 
        
        if(!__USER_WALLET_AUTO_CHARGE_SERVICE) {
            throw "Auto charge is unavailable to modify"
        }

        const __DELETE_WALLET_AUTO_CHARGE_SERVICE = await UserWalletAutoCharge.update({
            status: 'deleted'
        },{
            where: {id: user_wallet_auto_charge_id, user_id, status: 'active'}
        })

        return {is_deleted: true}
    }catch(err) {
        throw err
    }
}



//memberships
//memberships
//memberships
//memberships
//memberships
const listMembershipPlans = async function() {
    try{
        const __MEMBERSHIP_PLANS = await MembershipPlan.findAll({
            where: {status: 'active'},
            attributes: {
                include: [['id', 'membership_plan_id']],
                exclude: ['id']
            },
            order: [['plan_type', 'DESC']]
        })

        return {membership_plans: __MEMBERSHIP_PLANS};
    }catch(err) {
        throw err
    }
}


const admin_listMembershipPlans = async function() {
    try{
        const __MEMBERSHIP_PLANS = await MembershipPlan.findAll({
            where: {status: 'active'},
            attributes: {
                include: [['id', 'membership_plan_id']],
                exclude: ['id']
            },
            order: [['id', 'ASC']]
        })

        return {membership_plans: __MEMBERSHIP_PLANS};
    }catch(err) {
        throw err
    }
}


const membershipPlanDetails = async function(data) {
    // data = {membership_plan_id}
    try{
        const {membership_plan_id} = data
        const __MEMBERSHIP_PLAN = await MembershipPlan.findOne({
            where: {id: membership_plan_id},
            attributes: {
                include: [['id', 'membership_plan_id']],
                exlcude: ['id']
            }
        })

        if(!__MEMBERSHIP_PLAN) {
            throw "Membership plan not found"
        }

        return {membreship_plan: __MEMBERSHIP_PLAN.toJSON()}
    }catch(err) {
        throw err;
    }
}




const listUserMemberships = async function(data, user_id) {
    // data = {active_memberships, page, page_size, order_by, order_type}
    try{
        const {active_memberships, page, page_size, order_by, order_type} = data;

        const order = order_by && order_type ? [[ (order_by == 'membership_id' ? 'id' : order_by ), order_type ]] : [['id', 'DESC']];
        const activeFilter = active_memberships ? {
            expiredAt: {[Op.gte]: moment().toDate()}
        } : {};

        const query = {
            where: { user_id, ...activeFilter, status: 'active'},
            attributes: {
                include: [['id', 'membership_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: MembershipPlan,
                    attributes: {
                        include: [['id', 'membership_plan_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: Store,
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                }
            ]
        }

        const __MEMBERSHIPS = await CommonController.getPaginationResult({
            Model: Membership, query, page, page_size, order, as: 'memberships'
        })

        const membersips = __MEMBERSHIPS['memberships'].map((membership) => {
            membership = membership.toJSON()
            const image = S3Controller.getAwsS3SignedFileUrl(membership.store.image_url);
            membership.store['image'] = image;
            const logo = S3Controller.getAwsS3SignedFileUrl(membership.store.logo_url);
            membership.store['logo'] = logo;

            delete membership.store.image_url
            delete membership.store.logo_url

            return membership
        })

        return { total_count: __MEMBERSHIPS.total_count, membersips};
    }catch(err) {
        throw err
    }
}




const getUserMembershipDetails = async function(data, user_id) {
    // data = {membership_id}
    try{
        const {membership_id} = data;
        const __MEMBERSHIP = await Membership.findOne({
            where: { id: membership_id, user_id, status: 'active'},
            attributes: {
                include: [['id', 'membership_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: MembershipPlan,
                    attributes: {
                        include: [['id', 'membership_plan_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: Store,
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                }
            ]
        })

        const membership = __MEMBERSHIP.toJSON()
        const image = S3Controller.getAwsS3SignedFileUrl(membership.store.image_url);
        membership.store['image'] = image;
        const logo = S3Controller.getAwsS3SignedFileUrl(membership.store.logo_url);
        membership.store['logo'] = logo;

        delete membership.store.image_url
        delete membership.store.logo_url

        return {membership}
    }catch(err) {
        throw err;
    }
}





const createMembership = async function(data, user_id) {
    // data = {membership_plan_id, plan_days, store_id}
    const __SQL_TRANSACTION = await sequelize.transaction();
    try{
        const {membership_plan_id, plan_days, store_id} = data;

        const __STORE = await Store.findOne({
            where: {id: store_id},
            include: [
                {
                    model: StoreUser,
                    where: {user_id, store_id, is_store_owner: true}
                }
            ]
        })

        if(!__STORE) {
            throw "Only store owner can purchase membership."
        }

        const __MEMBERSHIP_PLAN = await (await membershipPlanDetails({membership_plan_id})).membreship_plan;
        const duration = plan_days;
        const expiredAt = moment().utc().add(duration, 'days');
        const membershipCharge = 
            plan_days == 30 ? __MEMBERSHIP_PLAN.plan_30_charge : 
            plan_days == 90 ? __MEMBERSHIP_PLAN.plan_90_charge :
            plan_days == 180 ? __MEMBERSHIP_PLAN.plan_180_charge :
            __MEMBERSHIP_PLAN.plan_365_charge;
        
        if(!membershipCharge) {
            throw "Please select plan days"
        }

        const storeWalletBalance = await CommonController.getStoreBalance(store_id);
        const __WALLET_SERVICE = await getStoreWalletPaymentService();

        if(storeWalletBalance < membershipCharge) {
            throw "Insufficient balance."
        }

        const __IS_USER_SUBSCRIBED = await Membership.findOne({
            where: {
                user_id,
                store_id,
                membership_plan_id,
                expiredAt: {[Op.gte]: moment().utc().toDate()},
                status: 'active'
            }
        })

        if(__IS_USER_SUBSCRIBED) {
            throw "Membership already exists."
        }

        // create transaction
        const __TRANSACTION = await Transaction.create({
            payment_service_id: __WALLET_SERVICE.id,
            transaction_type: 'membership',
            transaction_amount: membershipCharge,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        // create success tranaction history
        const __SUCCESS_TRANSACTION_HISTORY = await TransactionHistory.create({
            transaction_id: __TRANSACTION.id,
            transaction_status: 'success',
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        const __MEMBERSHIP = await Membership.create({
            user_id,
            store_id,
            membership_plan_id,
            transaction_id: __TRANSACTION.id,
            membership_charge: membershipCharge,
            duration,
            expiredAt,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        const newStoreBalance = storeWalletBalance - membershipCharge;

        const __STORE_WALLET_TRANSACTION = await StoreWalletTransaction.create({
            store_id,
            membership_id: __MEMBERSHIP.id,
            net_balance: newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance,
            status: 'active'
        },{
            transaction: __SQL_TRANSACTION
        })

        await CommonController.updateStoreBalance(store_id, newStoreBalance.toFixed(2) == 0 ? 0 : newStoreBalance, __SQL_TRANSACTION)

        await __SQL_TRANSACTION.commit();
        return {membership_id: __MEMBERSHIP.id}
    }catch(err) {
        await __SQL_TRANSACTION.rollback();
        throw err;
    }
}








//store
//store
//store
//store
//store
const listStoreTransactionHistories = async function(data, user_id, whereStores = {}) {
    // data = {page, page_size, from_date, to_date}
    try{
        const {page, page_size, from_date, to_date} = data;
        const __STORES = await Store.findAll(
            {
                where: { ...whereStores, status: 'active'},
                include: [
                    {
                        model: StoreUser,
                        where: {is_store_owner: true, user_id, status: 'active'}
                    }
                ]
            }
        )
        
        const order = [['id', 'DESC']];
        const whereDateFilter = (from_date && to_date) ? {
            [Op.and] : [
                {
                    updatedAt: {
                        [Op.gte] : from_date
                    },
                    createdAt: {
                        [Op.lte]: to_date
                    }
                }
            ]
        } : {};

        const query = {
            where: { 
                ...whereDateFilter,
                store_id: {[Op.in]: __STORES.map(s => s.id)}, 
                status: 'active'
            },
            attributes: {
                include: [['id', 'store_wallet_transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: Store,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: OrderTransaction,
                    required: false,
                    attributes: {
                        include: [['id', 'order_transaction_id']]
                    },
                    where: {status: 'active'},
                    include: [
                        {
                            model: Order,
                            attributes: {
                                include: [['id', 'order_id']],
                                exclude: ['id']
                            }
                        },
                        {
                            model: Transaction,
                            attributes: {
                                include: [['id', 'transaction_id']],
                                exclude: ['id']
                            }
                        }
                    ]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    attributes: {
                        include: [['id', 'order_item_refund_transaction_id']],
                        exclude: ['id']
                    },
                    where: {status: 'active'},
                    include: [
                        {
                            model: OrderItem,
                            where: {status: 'active'},
                            attributes: {
                                include: [['id', 'order_item_id']],
                                exclude: ['id']
                            }
                        },
                        {
                            model: Transaction,
                            attributes: {
                                include: [['id', 'transaction_id']],
                                exclude: ['id']
                            }
                        }
                    ]
                },
                {
                    model: StorePayout,
                    required: false,
                    attributes: {
                        include: [['id', 'store_payout_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: Membership,
                    required: false,
                    attributes: {
                        include: [['id', 'membership_id']],
                        exclude: ['id']
                    },
                    include: {
                        model: MembershipPlan,
                        attributes: {
                            include: [['id', 'membership_plan_id']],
                            exclude: ['id']
                        },
                    }
                },
                {
                    model: Transaction,
                    required: false,
                    attributes: {
                        include: [['id', 'transaction_id']],
                        exclude: ['id']
                    }
                }
            ]
        }

        const __STORE_WALLET_TRANASACTIONS =
        page && page_size
        ? await CommonController.getPaginationResult( { Model: StoreWalletTransaction, query, order, page, page_size, as: 'data'}) 
        : await CommonController.getFullResult({Model, query, order, as: 'data'})

        const transactions = __STORE_WALLET_TRANASACTIONS.data.map((tr) => {
            const walletTrasaction = tr.toJSON();
            const storeImage = S3Controller.getAwsS3SignedFileUrl(walletTrasaction.store.image_url);
            const storeLogo = S3Controller.getAwsS3SignedFileUrl(walletTrasaction.store.logo_url);

            walletTrasaction.store.image = storeImage;
            walletTrasaction.store.logo = storeLogo;

            delete walletTrasaction.store.image_url;
            delete walletTrasaction.store.logo_url;

            return walletTrasaction;
        })


        return {total_count: __STORE_WALLET_TRANASACTIONS.total_count, transactions};

    }catch(err) {
        throw err;
    }
}



const storeTransactionDetails = async function(data) {
    // data {store_id, store_wallet_transaction_id}
    try{
        const {store_id, store_wallet_transaction_id} = data;
        const __TRANSACTION = await StoreWalletTransaction.findOne({
            where: {id: store_wallet_transaction_id, store_id},
            attributes: {
                include: [['id', 'store_wallet_transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: Store,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                },
                {
                    model: OrderTransaction,
                    required: false,
                    attributes: {
                        include: [['id', 'order_transaction_id']]
                    },
                    where: {status: 'active'},
                    include: [
                        {
                            model: Order,
                            attributes: {
                                include: [['id', 'order_id']],
                                exclude: ['id']
                            }
                        },
                        {
                            model: Transaction,
                            attributes: {
                                include: [['id', 'transaction_id']],
                                exclude: ['id']
                            }
                        }
                    ]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    attributes: {
                        include: [['id', 'order_item_refund_transaction_id']],
                        exclude: ['id']
                    },
                    where: {status: 'active'},
                    include: [
                        {
                            model: OrderItem,
                            where: {status: 'active'},
                            attributes: {
                                include: [['id', 'order_item_id']],
                                exclude: ['id']
                            }
                        },
                        {
                            model: Transaction,
                            attributes: {
                                include: [['id', 'transaction_id']],
                                exclude: ['id']
                            }
                        }
                    ]
                },
                {
                    model: StorePayout,
                    required: false,
                    attributes: {
                        include: [['id', 'store_payout_id']],
                        exclude: ['id']
                    }
                }
            ]
        })

        if(!__TRANSACTION) {
            throw "Transaction not found"
        }


        const walletTrasaction = __TRANSACTION.toJSON();
        const storeImage = S3Controller.getAwsS3SignedFileUrl(walletTrasaction.store.image_url);
        const storeLogo = S3Controller.getAwsS3SignedFileUrl(walletTrasaction.store.logo_url);

        walletTrasaction.store.image = storeImage;
        walletTrasaction.store.logo = storeLogo;

        delete walletTrasaction.store.image_url;
        delete walletTrasaction.store.logo_url;

        return {transaction: walletTrasaction}

    }catch(err) {
        throw err;
    }
}















//user
//user
//user
//user
//user
//user



const listUserTransactionHistories = async function(data, user_id) {
    // data = {page, page_size, from_date, to_date}
    try{
        const {page, page_size, from_date, to_date} = data;

        const order = [['id', 'DESC']];
        const whereDateFilter = (from_date && to_date) ? {
            [Op.and] : [
                {
                    updatedAt: {
                        [Op.gte] : from_date
                    },
                    createdAt: {
                        [Op.lte]: to_date
                    }
                }
            ]
        } : {};

        const orderModelInclude = {
            model: Order,
            where: {status: 'active'},
            attributes: [['id', 'order_id']],
            required: false,
            include: [
                {
                    model: Store,
                    where: {status: 'active'},
                    required: false,
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                }
            ]
        }


        const query = {
            where: {
                ...whereDateFilter,
                user_id, status: 'active'
            },
            attributes: {
                include: [['id', 'user_wallet_transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: OrderTransaction,
                    required: false,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'order_transaction_id']]
                    },
                    include: [
                        orderModelInclude
                    ]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    where: {status: 'active'},
                    attributes: [['id', 'order_item_refund_transaction_id'], 'transaction_id'],
                    include: [
                        {
                            model: OrderItem,
                            where: {status: 'active'},
                        }
                    ]
                },
                {
                    model: Transaction,
                    required: false
                },
                {
                    model: UserWalletAutoCharge,
                    required: false,
                    attributes: [
                        ['id', 'user_wallet_autocharge_id'], 'user_stripe_card_id', 
                        'threshold_amount', 'auto_charge_type', 'charge_amount'
                    ]
                }
            ]
        }

        const __USER_WALLET_TRANSACTIONS = await CommonController.getPaginationResult({
            Model: UserWalletTransactions,
            as: 'data',
            order, page, page_size, query
        })


        const __TRANSACTIONS = await Transaction.findAll({
            where: {
                id: {
                    [Op.in]: __USER_WALLET_TRANSACTIONS.data.map((uwt) => {
                        if(uwt.transaction_id) {
                            return uwt.transaction_id;
                        }

                        if(uwt.order_transaction) {
                            return uwt.order_transaction.transaction_id;
                        }

                        if(uwt.order_item_refund_transaction) {
                            return uwt.order_item_refund_transaction.transaction_id
                        }

                        if(uwt.membership) {
                            return uwt.membership.transaction_id
                        }

                    })
                }
            },
            attributes: {
                include: [['id', 'transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: PaymentService,
                    attributes: [['id', 'payment_service_id'], 'payment_service_name']
                },
                {
                    model: TransactionHistory,
                    attributes: {
                        include: [['id', 'transaction_history_id']],
                        exclude: ['id']
                    }
                }
            ],
            order: [[TransactionHistory,sequelize.col("id"), "DESC"]]
        })


        const __ORDER_ITEMS = await OrderItem.findAll({
            where: {
                id: {
                    [Op.in]: __USER_WALLET_TRANSACTIONS.data.filter((uwt) => uwt.order_item_refund_transaction).map((uwt) => { uwt = uwt.toJSON(); return uwt.order_item_refund_transaction.order_item.id; })
                }
            },
            attributes: {
                include: [['id', 'order_item_id']],
                exclude: ['id']
            },
            include: [
                orderModelInclude
            ]
        })


        const userWalletTransactions = __USER_WALLET_TRANSACTIONS.data.map(uwt => {
            uwt = uwt.toJSON();

            if(uwt.transaction_id) {
                uwt.transaction = __TRANSACTIONS.find(t => {t=t.toJSON(); return t.transaction_id == uwt.transaction_id;}).toJSON();
                uwt.store = null;
            }

            if(uwt.order_transaction) {
                uwt.order_transaction.transaction = __TRANSACTIONS.find(t => {t=t.toJSON(); return t.transaction_id == uwt.order_transaction.transaction_id}).toJSON();
                uwt.store = uwt.order_transaction.order.store;
                delete uwt.order_transaction.order;
            }

            if(uwt.order_item_refund_transaction) {
                uwt.order_item_refund_transaction.transaction = __TRANSACTIONS.find(t =>{t=t.toJSON(); return t.transaction_id == uwt.order_item_refund_transaction.transaction_id}).toJSON();
                uwt.order_item_refund_transaction.order_item = __ORDER_ITEMS.find(roi => {roi=roi.toJSON(); return roi.order_item_id == uwt.order_item_refund_transaction.order_item.id}).toJSON()
                uwt.store = uwt.order_item_refund_transaction.order_item.order.store
                delete uwt.order_item_refund_transaction.order_item.order;
            }

            if(uwt.membership) {
                uwt.membership.transaction = __TRANSACTIONS.find(t => {t=t.toJSON(); return t.transaction_id == uwt.membership.transaction_id}).toJSON();
            }

            if(uwt.store != null) {
                uwt.store.logo = S3Controller.getAwsS3SignedFileUrl(uwt.store.logo_url);
                uwt.store.image = S3Controller.getAwsS3SignedFileUrl(uwt.store.image_url);
                delete uwt.store.logo_url;
                delete uwt.store.image_url;
            }

            return uwt;
        })

        return {total_count: __USER_WALLET_TRANSACTIONS.total_count, transactions: userWalletTransactions};

    }catch(err) {
        throw err;
    }
}





const getUserTransaction = async function(data, user_id) {
    // data = {user_wallet_transaction_id}
    try{
        const {user_wallet_transaction_id} = data;

        const orderModelInclude = {
            model: Order,
            where: {status: 'active'},
            attributes: [['id', 'order_id']],
            required: false,
            include: [
                {
                    model: Store,
                    where: {status: 'active'},
                    required: false,
                    attributes: {
                        include: [['id', 'store_id']],
                        exclude: ['id']
                    }
                }
            ]
        }

        const __USER_WALLET_TRANSACTION = await UserWalletTransactions.findOne({
            where: {id: user_wallet_transaction_id, user_id},
            attributes: {
                include: [['id', 'user_wallet_transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: OrderTransaction,
                    required: false,
                    where: {status: 'active'},
                    attributes: {
                        include: [['id', 'order_transaction_id']]
                    },
                    include: [
                        orderModelInclude
                    ]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    where: {status: 'active'},
                    attributes: [['id', 'order_item_refund_transaction_id'], 'transaction_id'],
                    include: [
                        {
                            model: OrderItem,
                            where: {status: 'active'},
                        }
                    ]
                },
                {
                    model: Transaction,
                    required: false
                },
                {
                    model: UserWalletAutoCharge,
                    required: false,
                    attributes: [
                        ['id', 'user_wallet_autocharge_id'], 'user_stripe_card_id', 
                        'threshold_amount', 'auto_charge_type', 'charge_amount'
                    ]
                },
                {
                    model: Membership,
                    required: false,
                    attributes: {
                        include: [['id', 'membership_id']],
                        exclude: ['id']
                    },
                    include: [
                        {
                            model: MembershipPlan,
                            required: false
                        }
                    ]
                }
            ]
        })

        if(!__USER_WALLET_TRANSACTION) {
            throw "Transaction not found"
        }


        const transaction_id = __USER_WALLET_TRANSACTION.transaction_id ? __USER_WALLET_TRANSACTION.transaction_id : 
                                __USER_WALLET_TRANSACTION.order_transcation_id ? __USER_WALLET_TRANSACTION.order_transaction.transaction_id :
                                __USER_WALLET_TRANSACTION.order_item_refund_transaction ? __USER_WALLET_TRANSACTION.order_item_refund_transaction.transaction_id :
                                __USER_WALLET_TRANSACTION.membership.transaction_id;
        
        
        // throw {__USER_WALLET_TRANSACTION}

        const __TRANSACTION = await Transaction.findOne({
            where: {id: transaction_id},
            attributes: {
                include: [['id', 'transaction_id']],
                exclude: ['id']
            },
            include: [
                {
                    model: PaymentService,
                    attributes: [['id', 'payment_service_id'], 'payment_service_name']
                },
                {
                    model: TransactionHistory,
                    attributes: {
                        include: [['id', 'transaction_history_id']],
                        exclude: ['id']
                    }
                }
            ],
            order: [[TransactionHistory,sequelize.col("id"), "DESC"]]
        })

        

        const uwt = __USER_WALLET_TRANSACTION.toJSON();

        if(uwt.transaction_id) {
            uwt.transaction = __TRANSACTION.toJSON()
            uwt.store = null;
        }

        if(uwt.order_transaction) {
            uwt.order_transaction.transaction = __TRANSACTION.toJSON()
            uwt.store = uwt.order_transaction.order.store;
            delete uwt.order_transaction.order;
        }

        if(uwt.order_item_refund_transaction) {

            const __ORDER_ITEMS = await OrderItem.findAll({
                where: {
                    id: __USER_WALLET_TRANSACTION.order_item_refund_transaction.order_item.id
                },
                attributes: {
                    include: [['id', 'order_item_id']],
                    exclude: ['id']
                },
                include: [
                    orderModelInclude
                ]
            })

            uwt.order_item_refund_transaction.transaction = __TRANSACTION.toJSON()
            uwt.order_item_refund_transaction.order_item = __ORDER_ITEMS.find(roi => {roi=roi.toJSON(); return roi.order_item_id == uwt.order_item_refund_transaction.order_item.id}).toJSON()
            uwt.store = uwt.order_item_refund_transaction.order_item.order.store
            delete uwt.order_item_refund_transaction.order_item.order;
        }

        if(uwt.membership) {
            uwt.membership.transaction = __TRANSACTION.toJSON();
        }

        if(uwt.store != null) {
            uwt.store.logo = S3Controller.getAwsS3SignedFileUrl(uwt.store.logo_url);
            uwt.store.image = S3Controller.getAwsS3SignedFileUrl(uwt.store.image_url);
            delete uwt.store.logo_url;
            delete uwt.store.image_url;
        }

        return {transaction: uwt}

    }catch(err) {
        throw err;
    }
}



















module.exports = {
    createOrderTransaction, confirmOrderTransaction,
    createAndConfirmOrderItemCancelTransaction, listStoreTransactionHistories, createReturnOrderTransction, 
    listUserTransactionHistories, storeTransactionDetails, getUserTransaction,
    createUserWalletAutoChargeService, updateUserWalletAutoChargeService, deleteUserWalletAutoChargeService,
    getUserWalletAutoChargeService, listMembershipPlans, createMembership, listUserMemberships, 
    getUserMembershipDetails, createCancelOrderTransaction, createStoreOrderTransctionAndReturnBalance, 

    admin_listMembershipPlans,


}