require('custom-env').env(true)

const sequelize = global['sequelize'];
const moment = require('moment');

const { Op } = require("sequelize")
const logger = require("../logger/logger")
const Notification = require("../models/notification/notification.model")
const OrderNotification = require("../models/notification/order_history_notification.model")
const Order = require("../models/order/order.model")
const OrderHistory = require("../models/order/order_history.model")
const OrderStatus = require("../models/order/order_status.model");
const Store = require('../models/store/store.model');
const StoreUser = require('../models/store/store_users.model');
const StorePayout = require('../models/transaction/store_payout.model');
const StoreWalletTransaction = require('../models/transaction/store_wallet_transaction.model');
const Transaction = require('../models/transaction/transaction.model');
const TransactionHistory = require('../models/transaction/transaction_history.model');
const UserWalletAutoCharge = require("../models/transaction/user_wallet_auto_charge.model");
const UserWalletTransactions = require('../models/transaction/user_wallet_transaction.model');
const User = require("../models/user/user.model");
const UserSession = require('../models/user/user_sessions.model');
const UserStripe = require('../models/user/user_stripe.model');
const UserStripeCard = require('../models/user/user_stripe_card.model');
const CommonController = require("./common.controller")
const SnsController = require("./sns.controller");
const StripeController = require('./stripe.controller');



const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
});








const orderHistoryNotificationController = async function() {
    try{
        const nonSendedOrderNotifications = await Notification.findAll({
            where: {
                is_sent: false,
                status: 'active',
            },
            include: [
                {
                    model: Order,
                    where: {status: 'active'}
                }
            ]
        })

        await Notification.update({is_sent: true}, {where: {id: {[Op.in]: nonSendedOrderNotifications.map(n => n.id)}}})

        for(let i=0; i<nonSendedOrderNotifications.length; i++) {
            const order_id = nonSendedOrderNotifications[i].order_id;
            const store_id = nonSendedOrderNotifications[i].store_id;
            const user_id = nonSendedOrderNotifications[i].user_id;
            const title = nonSendedOrderNotifications[i].title;
            const message = nonSendedOrderNotifications[i].message;
            const sender_type = nonSendedOrderNotifications[i].is_notification_for_store ? 'store' : 'user'

            const data = {
                store_id, order_id, type: 'order', sender_type
            }

            const __IS_PUSH_NOTIFICATION_AVAILABLE = await CommonController.isOpenForNotification(user_id, nonSendedOrderNotifications[i].is_notification_for_store, 'order')
            if(__IS_PUSH_NOTIFICATION_AVAILABLE) {
                const userTokens = await CommonController.getUserTokens(user_id);
                await SnsController.sendMutliPushNotifications(userTokens, title, message, data)
            }
        }
    }catch(err) {
        throw err
    }
}






const autoChargesCroneController = async function() {
    try{

        const __AUTO_CHARGES = await UserWalletAutoCharge.findAll({
            where: {
                start_date: {[Op.lte] : moment().utc().toDate()},
                status: 'active'
            },
            include: [
                {
                    model: UserStripeCard,
                    where: {status: 'active'}
                },
                {
                    model: UserWalletTransactions,
                    required: false,
                    where: {
                        [Op.and]: [
                            sequelize.where(
                                sequelize.fn('DATE', sequelize.col("user_wallet_transactions.createdAt")),
                                sequelize.literal('CURRENT_DATE')
                            ),
                            {
                                user_wallet_auto_charge_id: {[Op.ne]: null}
                            }
                        ]
                    }
                }
            ]
        })
        console.log("__AUTO_CHARGES==",__AUTO_CHARGES)
        
        const __TODAY_CHARGES = __AUTO_CHARGES
            .filter((ac) => {
                const startDate = moment(ac.start_date).utc();
                if(ac.frequency == 7 && ac.user_wallet_transactions.length == 0 && ac.day) {
                    const freqOfWeek = ac.day - 1;
                    const currentDatFreq = moment().utc().day();
                    if(freqOfWeek == currentDatFreq) {
                        return true
                    }
                } else if(ac.frequency == 30 && ac.user_wallet_transactions.length == 0 && ac.day) {
                    const startDay = ac.day;
                    const currentDay = moment().utc().get('date');

                    // logger.log({startDay, currentDay})

                    if(startDay == currentDay) {return true;}
                    else if ( startDay >= 28 ) {
                        var currentDate = new Date();
                        var currentMonth = currentDate.getMonth();
                        var nextMonth = currentMonth + 1;
                        var nextMonthFirstDay = new Date(currentDate.getFullYear(), nextMonth, 1);
                        var currentMonthLastDay = new Date(nextMonthFirstDay - 1);
                        var totalDays = currentMonthLastDay.getDate();

                        if(totalDays == 28 && startDay >= 28) {return true;}
                        else if(totalDays == 29 && startDay >= 28) {return true;}
                        else if(totalDays == 30 && startDay >= 30) {return true;}
                        else if(totalDays == 31 && startDay >= 31) {return true;}
                    }
                }
                else if(ac.frequency == 1 && ac.user_wallet_transactions.length == 0){
                    return true
                }
                return false;
            })
            .map((ac) => ac.toJSON())
            console.log("__TODAY_CHARGES==",__TODAY_CHARGES)
        
        for(let i = 0; i<__TODAY_CHARGES.length; i++) {            
            const todayCharge = __TODAY_CHARGES[i];
            try{
                if(todayCharge.auto_charge_type == 'threshold') {
                    const balance = await CommonController.getUserCurrentBalance(todayCharge.user_id);
                    console.log("Balance=",balance)
                    if(balance < todayCharge.threshold_amount) {
                        await StripeController.userWalletRechargeWithCard(
                            {user_stripe_card_id: todayCharge.user_stripe_card_id, amount: todayCharge.charge_amount},
                            todayCharge.user_id,
                            todayCharge.id
                        )
                    }
                }else{
                    await StripeController.userWalletRechargeWithCard(
                        {user_stripe_card_id: todayCharge.user_stripe_card_id, amount: todayCharge.charge_amount},
                        todayCharge.user_id,
                        todayCharge.id
                    )
                }
            }catch(err) {
                // logger.err(err);
            }
        }
        
    }catch(err) {
        // logger.err(err);
    }
}







const payoutsManageController = async function() {
    try{
        const successPayouts = await StoreWalletTransaction.findAll({
            where: {
                store_payout_id: {[Op.ne]: null}, status: 'active'
            },
            include: [
                {
                    model: StorePayout,
                    where: {is_reversed: null, stripe_transfer_id: {[Op.ne] : null}, stripe_payout_id: {[Op.ne] : null}, status: 'active'},
                    include: [
                        {
                            model: Transaction,
                            where: {transaction_type: 'payout'},
                            include: [
                                {
                                    model: TransactionHistory,
                                    where: {
                                        transaction_status: 'success'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        })


        const failedPayouts = await StoreWalletTransaction.findAll({
            where: {
                store_payout_id: {[Op.ne]: null}, status: 'active'
            },
            include: [
                {
                    model: StorePayout,
                    where: {is_reversed: null, stripe_transfer_id: {[Op.ne] : null}, stripe_payout_id: {[Op.ne] : null}, status: 'active'},
                    include: [
                        {
                            model: Transaction,
                            where: {transaction_type: 'payout'},
                            include: [
                                {
                                    model: TransactionHistory,
                                    where: {
                                        transaction_status: 'failed'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        let notInPayouts = successPayouts.map(sp => sp.in)
        notInPayouts = [...notInPayouts, ...failedPayouts.map(fp => fp.id)]

        const __STRIPE_WALLET_TRANSACTIONS = await StoreWalletTransaction.findAll({
            where: {
                store_payout_id: {[Op.ne]: null}, status: 'active',
                id: {[Op.notIn]: notInPayouts}
            },
            include: [
                {
                    model: StorePayout,
                    where: {is_reversed: null, stripe_transfer_id: {[Op.ne] : null}, stripe_payout_id: {[Op.ne] : null}, status: 'active'},
                    include: [
                        {
                            model: Transaction,
                            where: {transaction_type: 'payout'},
                            include: [
                                {
                                    model: TransactionHistory,
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        for(let i=0; i<__STRIPE_WALLET_TRANSACTIONS.length; i++) {
            let swt = __STRIPE_WALLET_TRANSACTIONS[i].toJSON();
            
            const __STORE = await Store.findOne({
                where: {id: swt.store_id},
                include: [
                    {
                        model: StoreUser,
                        where: {is_store_owner: true},
                    }
                ]
            })

            const __USER_STRIPE = await UserStripe.findOne({where: {user_id: __STORE.store_users[0].user_id}})
            
            stripe.payouts.retrieve(
                swt.store_payout.stripe_payout_id,
                {
                    stripeAccount: __USER_STRIPE.stripe_connected_account_id
                }
            ).then(async (payout) => {
                if(payout.status == "paid") {
                    await TransactionHistory.create({transaction_id: swt.store_payout.transaction_id, transaction_status: 'success', status: 'active'});
                }
                else if(payout.status == "failed") {
                    await StripeController.returnStripePayout(payout.metadata)
                }
            }).catch(err => 
                console.log(err)
                )

        }

    }catch(err) {
        // logger.log(err);
    }
}






const deleteOldUserSessionsController = async function() {
    try{
        const __OLD_USER_SESSIONS = await UserSession.findAll({
            where: {
                status: 'active',
                expiredAt: {
                    [Op.lte]: moment().utc().toDate()
                }
            }
        })

        if(__OLD_USER_SESSIONS?.length == 0) {
            return
        }

        await UserSession.update({
            status: 'deleted',
            where: {
                id: {
                    [Op.in] : __OLD_USER_SESSIONS.map(ous => ous.id)
                }
            }
        })

    }catch(err) {
        // logger.log(err);
    }
}







module.exports = {
    orderHistoryNotificationController,
    autoChargesCroneController,
    payoutsManageController,
    deleteOldUserSessionsController,
}
