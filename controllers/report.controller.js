const { Op, Sequelize } = require("sequelize");
const moment = require('moment');
const logger = require("../logger/logger");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const StoreUser = require("../models/store/store_users.model");
const User = require("../models/user/user.model");
const { getStateId, createXLSXfile } = require("./common.controller");

const { sendXLSXEmail } = require("./sns.controller");
const Admin = require("../models/admin/admin.model");
const UserSession = require("../models/user/user_sessions.model");
const StoreVisitor = require("../models/store/store_visitor.model");
const { getAddressUsingLatLong } = require("./usps.controller");
const StoreWalletTransaction = require("../models/transaction/store_wallet_transaction.model");
const OrderTransaction = require("../models/transaction/order_transaction.model");
const Transaction = require("../models/transaction/transaction.model");
const OrderItemRefundTransaction = require("../models/transaction/order_item_refund_transaction.model");
const StorePayout = require("../models/transaction/store_payout.model");
const Order = require("../models/order/order.model");
const ReturnOrderItem = require("../models/order/return_order_item.model");
const OrderItem = require("../models/order/order_item.model");
const TransactionHistory = require("../models/transaction/transaction_history.model");
const UserWalletTransactions = require("../models/transaction/user_wallet_transaction.model");
const PaymentService = require("../models/transaction/payment_service.model");
const Membership = require("../models/transaction/membership.model");
const UserWalletAutoCharge = require("../models/transaction/user_wallet_auto_charge.model");
const USPSController = require('./usps.controller');




const listStoreReports = async function(data, user_id = null) {
    // data = {country, state, from_date, to_date}
    try{
        const {country, state, from_date, to_date} = data;

        let whereState = {}
        const whereUser = user_id ? {user_id} : {};

        if(country && state) {
            const state_id = await getStateId(country, state);
            whereState = {state_id}
        }

        const __STORES = await Store.findAll({
            where: {
                [Op.and] : [
                    from_date ? {createdAt: {[Op.gte]:moment(from_date).utc()}} : {status: 'active'},
                    to_date ? {createdAt: {[Op.lte]:moment(to_date).add(1, 'days').utc()}} : {status: 'active'}
                ],
                status: 'active'
            },
            order: [['id', 'DESC']],
            include: [
                {
                    model: StoreAddress,
                    where: {status: 'active'},
                    required: false,
                    include: [{
                        model: State, 
                        include: [
                            {model: Country}
                        ]
                    }]
                },
                {
                    model: StoreUser,
                    required: user_id ? true : false,
                    where: { ...whereUser, status: 'active'},
                    include: [
                        {
                            model: User,
                            where: {status: 'active'}
                        }
                    ]
                }
            ]
        })

        const stores = __STORES.map((s) => {
            s = s.toJSON()
            return {
                'Id': s.id,
                'Registered at': moment(s.createdAt).utc().format("YYYY-MM-DD"),
                'Store Name': s.store_name,
                'Store Email': s.store_email,
                'Store Phone': s.store_phone_code +'-'+ s.store_phone,
                'EIN': s.store_ein,
                'Owner Name': s.store_users.length ? `${s.store_users[0].user.first_name} ${s.store_users[0].user.last_name}` : 'NA',
                'Address Line 1': s.store_addresses.length ? s.store_addresses[0].address_line_1 : 'NA',
                'Address Line 2': s.store_addresses.length ? s.store_addresses[0].address_line_2 : 'NA',
                'City': s.store_addresses.length ? s.store_addresses[0].city : 'NA',
                'State': s.store_addresses.length ? s.store_addresses[0].state.state_name : 'NA',
                'Country': s.store_addresses.length ? s.store_addresses[0].state.country.country_name : 'NA',
            }
        })

        if(stores.length < 1) {
            throw "No data found"
        }

        return stores;

    }catch(err) {
        throw err;
    }
}



const listStoreTransactionReports = async function(data, user_id = null) {
    // data = {stores, from, to}
    // stores = [{store_id}]
    try{
        const {stores, from, to} = data;
        const whereUser = user_id ? {user_id} : {};

        if(!from) {
            throw "Please select from date"
        }

        if(!to) {
            throw "Please select from date"
        }

        const whereStores = user_id ? {store_id: {[Op.in] : stores.map(s => s.store_id)}} :
                stores.length ? {store_id: {[Op.in] : stores.map(s => s.store_id)}} : {};
        

        const __STORE_WALLET_TRANASACTIONS = await StoreWalletTransaction.findAll({
            where: {
                ...whereStores,
                createdAt: {[Op.gte] : moment(from).utc()},
                updatedAt: {[Op.lte]: moment(to).add(1, 'days').utc()},
            },
            include: [
                {
                    model: Store,
                    required: false
                },
                {
                    model: OrderTransaction,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}, {model: Order, include: [{model: OrderItem}]}]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}, {model: OrderItem}]
                },
                {
                    model: StorePayout,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}]
                },
                {
                    model: Membership,
                    required: false,
                    include: [{model: Transaction}]
                },
            ]
        })

        const __USER_WALLET_TRANSACTIONS = await UserWalletTransactions.findAll({
            where: {
                ...whereUser, 
                createdAt: {[Op.gte] : moment(from).utc()},
                updatedAt: {[Op.lte]: moment(to).add(1, 'days').utc()},
            },
            include: [
                {
                    model: User
                },
                {
                    model: Transaction,
                    required: false,
                    include: [{model: PaymentService}]
                },
                {
                    model: OrderTransaction,
                    required: false,
                    include: [{model: Transaction}, {model: Order, include: [{model: Store}]}]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    include: [{model: Transaction}]
                },
                {
                    model: UserWalletAutoCharge,
                    required: false,
                },
            ]
        })


        const storeReport = []
        const storeDatas = []

        const userReport = [];
        const userDatas = [];

        __STORE_WALLET_TRANASACTIONS.forEach((swt) => {
            swt = swt.toJSON();
            const storeTransactionType = 
                swt.order_transaction 
                    ? (swt.order_transaction.order_transaction_type == "order" ? "SALE" : "ORDER CANCEL")
                    :
                swt.order_item_refund_transaction ? 
                      swt.order_item_refund_transaction.transaction.transaction_type == 'item cancel' ? "ITEM CANCEL" : "ITEM RETURN"
                    :
                swt.store_payout.transaction.transaction_type == "payout" ? "PAYOUT" : "PAYOUT FAILED";
            

            const transactionStatus = storeTransactionType == "SALE" || storeTransactionType == "PAYOUT FAILED" ? "CREDIT" : "DEBIT";

            const transactionId = swt.order_transaction ? 
                swt.order_transaction.transaction_id :
                swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction_id :
                swt.store_payout.transaction_id;
            
            const amount = swt.order_transaction ? swt.order_transaction.transaction.transaction_amount :
                swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction.transaction_amount :
                swt.store_payout.total_transaction_amount || swt.store_payout.total_reversed_amount;

            const reflectedAmount = swt.order_transaction 
                ? swt.order_transaction.store_received_amount
                : swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction.transaction_amount
                : swt.store_payout.transfered_amount || swt.store_payout.total_reversed_amount;

            const transaction = {
                "Transaction Id" : transactionId,
                "Store Id" : swt.store.id,
                "Store Name" : swt.store.store_name,
                "Date" : moment(swt.createdAt).format("yyyy-MM-DD"),
                "Amount": "$"+amount.toFixed(2),
                "Reflected Amount": "$"+reflectedAmount.toFixed(2),
                "Store Balance": "$"+swt.net_balance.toFixed(2),
                "Particulars" : storeTransactionType,
                "Transaction Type" : transactionStatus,
            }


            storeDatas.push(transaction)
            const report = storeReport.find(sr => sr['Store Id'] == swt.store_id)

            if(!report) {
                storeReport.push({
                    "Store Id" : swt.store_id,
                    "Store Name" : transaction["Store Name"],
                    "Total Sales" : storeTransactionType == "SALE" ? reflectedAmount : 0,
                    "Payouts" : storeTransactionType == "PAYOUT" ? reflectedAmount : 0,
                    "Total Return Value" : storeTransactionType == "ITEM RETURN" ? reflectedAmount : 0,
                    "Cancellations" : storeTransactionType == "ITEM CANCEL" ? reflectedAmount : 0,
                    "Payouts Refunds" : storeTransactionType == "PAYOUT FAILED" ? reflectedAmount : 0
                })
            }else{
                if(storeTransactionType == "SALE") {
                    report["Total Sales"] = report["Total Sales"] + reflectedAmount;
                }
                if(storeTransactionType == "PAYOUT") {
                    report["Payouts"] = report["Payouts"] + reflectedAmount;
                }
                if(storeTransactionType == "ITEM RETURN") {
                    report["Total Return Value"] = report["Total Return Value"] + reflectedAmount;
                }
                if(storeTransactionType == "ITEM CANCEL") {
                    report["Cancellations"] = report["Cancellations"] + reflectedAmount;
                }
                if(storeTransactionType == "PAYOUT FAILED") {
                    report["Payouts Refunds"] = report["Payouts Refunds"] + reflectedAmount;
                }
            }
        })


        __USER_WALLET_TRANSACTIONS.forEach((uwt) => {
            uwt = uwt.toJSON();

            const transactionType = 
                uwt.order_transaction ?  
                    uwt.order_transaction.order_transaction_type == "order" ? "ORDER" : "ORDER CANCEL"
                :
                uwt.transaction ? 'WALLET RECHARGE'
                :
                uwt.order_item_refund_transaction ?
                    uwt.order_item_refund_transaction.transaction.transaction_type == 'item cancel' ? "ITEM CANCEL" : "ITEM RETURN"
                :
                'MEMBERSHIP';

            const transactionStatus = transactionType == "ORDER" ? "DEBIT" : "CREDIT";

            const transactionId = uwt.order_transaction ? 
                uwt.order_transaction.transaction_id :
                uwt.order_item_refund_transaction ? uwt.order_item_refund_transaction.transaction_id :
                uwt.transaction ? uwt.transaction.id :
                uwt.membership.transaction_id;

            const amount = uwt.order_transaction ? 
                uwt.order_transaction.transaction.transaction_amount :
                uwt.order_item_refund_transaction ? uwt.order_item_refund_transaction.transaction.transaction_amount :
                uwt.transaction ? uwt.transaction.transaction_amount :
                uwt.membership.transaction.transaction_amount;

            const paymentMethod = uwt.transaction ? uwt.transaction.payment_service.payment_service_name.toUpperCase() : "WALLET"

            const transaction = {
                "Transction Id" : transactionId,
                "Store Id" : uwt.order_transaction ? uwt.order_transaction.order.store_id : "NA",
                "Store Name" : uwt.order_transaction ? uwt.order_transaction.order.store.store_name : "NA",
                "User Id" : uwt.user_id,
                "User Name" : uwt.user.first_name + " " + uwt.user.last_name,
                "Date" : moment(uwt.createdAt).format("yyyy-MM-DD"),
                "Amount": "$"+amount.toFixed(2),
                "Balance": "$"+uwt.net_balance.toFixed(2),
                "Particulars" : transactionType,
                "Transaction Type" : transactionStatus,
                "Payment Method" : paymentMethod
            }

            userDatas.push(transaction)
            
        })

        const buffer = createXLSXfile([{
            sheetName: "Store Wallet Transactions",
            data: storeDatas
        },{
            sheetName: "Store Report",
            data: storeReport.map(sr => {
                return {
                    ...sr,
                    "Total Sales" : "$"+sr["Total Sales"]?.toFixed(2),
                    "Payouts" : "$"+sr["Payouts"]?.toFixed(2),
                    "Total Return Value" : "$"+sr["Total Return Value"]?.toFixed(2),
                    "Payouts Refunds" : "$"+sr["Payouts Refunds"]?.toFixed(2),
                    "Cancellations" : "$"+sr["Cancellations"]?.toFixed(2)
                }
            })
        },{
            sheetName: "User Wallet Transactions",
            data: userDatas
        }]);

        return buffer;

    }catch(err) {
        throw err;
    }
}



const listCompleteTransactions = async function(data) {
    // data = {stores, from_date, to_date}
    // stores = [{store_id}]
    try{
        const {stores, from_date, to_date} = data;
        const whereStores = stores?.length ? {store_id: {[Op.in] : stores.map(s = s.store_id)}} : {};

        if(!from_date) { throw "Please select from date" }
        if(!to_date) { throw "Please select from date" }
        
        const __STORE_WALLET_TRANASACTIONS = await StoreWalletTransaction.findAll({
            where: {
                ...whereStores,
                createdAt: {[Op.gte] : moment(from_date).utc()},
                updatedAt: {[Op.lte]: moment(to_date).add(1, 'days').utc()}
            },
            include: [
                {
                    model: Store
                },
                {
                    model: OrderTransaction,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}, {model: Order, include: [{model: OrderItem}]}]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}, {model: OrderItem}]
                },
                {
                    model: StorePayout,
                    required: false,
                    include: [{model: Transaction, include: [{model: TransactionHistory, order: [['id', 'DESC']], limit: 1}]}]
                }
            ]
        })

        const __USER_WALLET_TRANSACTIONS = await UserWalletTransactions.findAll({
            include: [
                {
                    model: User
                },
                {
                    model: Transaction,
                    required: false,
                    include: [{model: PaymentService}]
                },
                {
                    model: OrderTransaction,
                    required: false,
                    include: [{model: Transaction}, {model: Order, include: [{model: Store}]}]
                },
                {
                    model: OrderItemRefundTransaction,
                    required: false,
                    include: [{model: Transaction}]
                },
                {
                    model: Membership,
                    required: false,
                    include: [{model: Transaction}]
                },
                {
                    model: UserWalletAutoCharge,
                    required: false,
                },
            ]
        })

        const storeReport = []
        const datas = []

        const userReport = [];
        const userDatas = [];

        __STORE_WALLET_TRANASACTIONS.forEach((swt) => {
            swt = swt.toJSON();
            const storeTransactionType = 
                swt.order_transaction 
                    ? (swt.order_transaction.transaction.transaction_type == "order" ? "SALE" : "ORDER CANCEL")
                    :
                swt.order_item_refund_transaction
                    ? swt.order_item_refund_transaction.transaction.transaction_type == "item cancel" ? "ITEM CANCEL" : "ITEM RETURN"
                    :
                swt.store_payout.transaction.transaction_type == "payout" ? "PAYOUT" : "PAYOUT FAILED";
            
            const transactionStatus = storeTransactionType == "SALE" || storeTransactionType == "PAYOUT FAILED" ? "CREDITED" : "DEBITED";

            const transactionId = swt.order_transaction ? 
                swt.order_transaction.transaction_id :
                swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction_id :
                swt.store_payout.transaction_id;
            
            const amount = swt.order_transaction ? swt.order_transaction.transaction.transaction_amount :
                swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction.transaction_amount :
                swt.store_payout.total_transaction_amount || swt.store_payout.total_reversed_amount;

            const reflectedAmount = swt.order_transaction 
                ? swt.order_transaction.store_received_amount
                : swt.order_item_refund_transaction ? swt.order_item_refund_transaction.transaction.transaction_amount
                : swt.store_payout.transfered_amount || swt.store_payout.total_reversed_amount;

            const deliveryCharge = swt.order_transaction ? swt.order_transaction.order.delivery_charge : 0;

            const transaction = {
                "Transaction Id" : swt.id,
                "Store Id" : swt.store.id,
                "Store Name" : swt.store.store_name,
                "Date" : moment(swt.createdAt).format("yyyy-MM-DD"),
                "Particulars" : storeTransactionType,
                "Transaction Type" : transactionStatus,
                "Amount": "$"+amount.toFixed(2),
                "Reflected Amount": "$"+reflectedAmount.toFixed(2),
                "Balance": "$"+swt.net_balance.toFixed(2),
                "Total Products": swt.order_transaction ? swt.order_transaction.order.order_items.length : 'NA',
                "Order Service Charged": "$"+(swt.order_transaction? swt.order_transaction.order_total_service_charged.toFixed(2): 0),
                "Store Service Charged": "$"+(swt.order_transaction? swt.order_transaction.store_total_service_charged.toFixed(2): 0),
                "Tax": "$" + (swt.order_transaction ? swt.order_transaction.order.total_tax_charged.toFixed(2) : 0),
                "Delivery Charge": "$"+deliveryCharge,
            }

            datas.push(transaction)
            let report = storeReport.find(sr => sr['Store Id'] == swt.store_id)

            if(!report) {
                report = {
                    "Store Id" : swt.store.id,
                    "Store Name" : swt.store.store_name,
                    "Total Orders": 0,
                    "Total Credits" : 0,
                    "Total Debits": 0,
                    "Total Sales": 0,
                    "Total Return Value": 0,
                    "Cancellations": 0,
                    "Tax": 0,
                    "Tax Reverse": 0,
                    "Order Service Charge": 0,
                    "Order Service Charge Reversed": 0,
                    "Store Service Charge": 0,
                    "Store Service Charge Reversed": 0,
                    "Delivery Charge": 0,
                    "Payouts": 0,
                    "Payouts Failed": 0,
                }
                storeReport.push(report)
            }

            if(storeTransactionType == 'SALE') {
                report["Total Credits"] += reflectedAmount;
                report["Total Orders"] += 1;
                report["Total Sales"] += amount;
                report["Tax"] += swt.order_transaction.order.total_tax_charged;
                report["Order Service Charge"] += swt.order_transaction.order_total_service_charged;
                report["Store Service Charge"] += swt.order_transaction.store_total_service_charged;
                report["Delivery Charge"] += swt.order_transaction.order.delivery_charge;
            }

            if(storeTransactionType == "ORDER CANCEL") {
                report["Total Debits"] += reflectedAmount;
                report["Cancellations"] += amount;
                report["Tax Reverse"] += swt.order_transaction.order.total_tax_charged;
                report["Order Service Charge Reversed"] += swt.order_transaction.order_total_service_charged;
                report["Store Service Charge Reversed"] += swt.order_transaction.store_total_service_charged;
            }
            
            if(storeTransactionType == "ITEM CANCEL") {
                report["Total Debits"] += reflectedAmount;
                report["Cancellations"] += amount;
            }

            if(storeTransactionType == "ITEM RETURN") {
                report["Total Debits"] += reflectedAmount;
                report["Total Return Value"] += amount;
            }

            if(storeTransactionType == "PAYOUT") {
                report["Total Debits"] += reflectedAmount;
                report["Payouts"] += amount;
            }

            if(storeTransactionType == "PAYOUT Failed") {
                report["Total Credits"] += reflectedAmount;
                report["Payouts Failed"] += amount;
            }

        })

        __USER_WALLET_TRANSACTIONS.forEach((uwt) => {
            uwt = uwt.toJSON();

            const transactionType = 
                uwt.order_transaction ?  
                    uwt.order_transaction.order_transaction_type == "order" ? "ORDER" : "ORDER CANCEL"
                :
                uwt.transaction ? 'WALLET RECHARGE'
                :
                uwt.order_item_refund_transaction ?
                    uwt.order_item_refund_transaction.transaction.transaction_type == 'item cancel' ? "ITEM CANCEL" : "ITEM RETURN"
                :
                'MEMBERSHIP';

            const transactionStatus = transactionType == "ORDER" ? "DEBIT" : "CREDIT";

            const transactionId = uwt.order_transaction ? 
                uwt.order_transaction.transaction_id :
                uwt.order_item_refund_transaction ? uwt.order_item_refund_transaction.transaction_id :
                uwt.transaction ? uwt.transaction.id :
                uwt.membership.transaction_id;

            const amount = uwt.order_transaction ? 
                uwt.order_transaction.transaction.transaction_amount :
                uwt.order_item_refund_transaction ? uwt.order_item_refund_transaction.transaction.transaction_amount :
                uwt.transaction ? uwt.transaction.transaction_amount :
                uwt.membership.transaction.transaction_amount;

            const paymentMethod = uwt.transaction ? uwt.transaction.payment_service.payment_service_name.toUpperCase() : "WALLET"

            const transaction = {
                "Id" : uwt.id,
                "Store Id" : uwt.order_transaction ? uwt.order_transaction.order.store_id : "NA",
                "Store Name" : uwt.order_transaction ? uwt.order_transaction.order.store.store_name : "NA",
                "User Id" : uwt.user_id,
                "User Name" : uwt.user.first_name + " " + uwt.user.last_name,
                "Date" : moment(uwt.createdAt).format("yyyy-MM-DD"),
                "Transaction Id": transactionId,
                "Amount": "$"+amount.toFixed(2),
                "Balance": "$"+uwt.net_balance.toFixed(2),
                "Transaction Type" : transactionType,
                "Transaction Status" : transactionStatus,
                "Payment Method" : paymentMethod
            }

            userDatas.push(transaction)
            
        })

        const buffer = createXLSXfile([{
                sheetName: "Store Transactions Report",
                data: datas
            },
            {
                sheetName: "User Transactions Report",
                data: userDatas
            }
            ,{
                sheetName: "Financial Report",
                data: storeReport.map((d) => {
                    return {
                        ...d,
                        "Total Credits" : "$"+d["Total Credits"]?.toFixed(2),
                        "Total Debits": "$"+d["Total Debits"]?.toFixed(2),
                        "Total Sales": "$"+d["Total Sales"]?.toFixed(2),
                        "Total Return Value": "$"+d["Total Return Value"]?.toFixed(2),
                        "Cancellations": "$"+d["Cancellations"]?.toFixed(2),
                        "Tax": "$"+d["Tax"]?.toFixed(2),
                        "Tax Reverse": "$"+d["Tax Reverse"]?.toFixed(2),
                        "Order Service Charge": "$"+d["Order Service Charge"]?.toFixed(2),
                        "Order Service Charge Reversed": "$"+d["Order Service Charge Reversed"]?.toFixed(2),
                        "Store Service Charge": "$"+d["Store Service Charge"]?.toFixed(2),
                        "Store Service Charge Reversed": "$"+d["Store Service Charge Reversed"]?.toFixed(2),
                        "Delivery Charge": "$"+d["Delivery Charge"]?.toFixed(2),
                        "Payouts": "$"+d["Payouts"]?.toFixed(2),
                        "Payouts Failed": "$"+d["Payouts Failed"]?.toFixed(2),
                    }
                })
            }
        ]);

        return buffer;

    }catch(err) {
        throw err;
    }
}



const user_listStoreReports = async function(data, user_id) {
    // data = {country, state, from_date, to_date}
    try{
        const {country, state, from_date, to_date} = data;
        const stores = await listStoreReports(data, user_id)

        const __USER = await User.findOne({where: {id: user_id}});

        const buffer = createXLSXfile([{
            sheetName: "Stores",
            data: stores
        }]);
        await sendXLSXEmail(__USER.email, 'Stores report', 'stores.xlsx', buffer, 'Please refer to the attached Store Reports Excel Sheet')

        return {
            is_email_sent: true
        }
    }catch(err) {
        throw err;
    }
}



const admin_listStoreReports = async function(data, admin_id) {
    // data = {user_id, country, state, from_date, to_date}
    try{
        const {user_id, country, state, from_date, to_date} = data;
        const stores = await listStoreReports(data, user_id ? user_id : null)

        const __ADMIN = await Admin.findOne({where: {id: admin_id}});

        const buffer = createXLSXfile([{
            sheetName: "Stores",
            data: stores
        }]);
        await sendXLSXEmail(__ADMIN.email, 'Stores report', 'stores.xlsx', buffer, 'Please refer to the attached Store Reports Excel Sheet')

        return {
            is_email_sent: true
        }

    }catch(err) {
        throw err;
    }
}



const admin_listWatchUsersList = async function(data, admin_id) {
    // data = { state, country, from_date, to_date}
    // stores = [{store_id}]
    try{
        const { state, country, from_date, to_date} = data;

        const whereState = state ? [{state: {[Op.iLike] : state}}] : []
        const whereCountry = country ? [{country: {[Op.iLike] : country}}] : []


        const __STORE_VISITORS = await StoreVisitor.findAll({
            where: {
                [Op.and]: [
                    ...whereState,
                    ...whereCountry,
                    { createdAt: {[Op.gte]: moment(from_date).utc()}},
                    {updatedAt: {[Op.lte]: moment(to_date).add(1, 'days').utc()}}
                ]
            },
            order: [['id', 'DESC']],
            include: [
                {
                    model: User
                },
                {
                    model: Store,
                    include: {
                        model: StoreAddress
                    }
                },
            ]
        })

        const storesUsers = {}
        for(let i=0; i<__STORE_VISITORS.length; i++) {
            const sv = __STORE_VISITORS[i].toJSON();

            if(!storesUsers[sv.store.id]) {
                storesUsers[sv.store.id] = {}
            }

            if(!storesUsers[sv.store.id][`${sv.city}-${sv.state}-${sv.country}`]) {
                storesUsers[sv.store.id][`${sv.city}-${sv.state}-${sv.country}`] = [];
            }

            storesUsers[sv.store.id][`${sv.city}-${sv.state}-${sv.country}`].push(sv);
            
        }


        const datas = [];
        
        for(const storeId in storesUsers) {
            const total = {"Store Id": "Total", "Store Name": "", "Views" : 0}
            const storeUser = storesUsers[storeId]
            for(let cityStateCountry in storeUser) {
                const details = storeUser[cityStateCountry];
                const address = await USPSController.getAddressUsingLatLong(details[0].store.store_addresses[0].latitude, details[0].store.store_addresses[0].longitude);
                datas.push({
                    "Store Id" : details[0].store_id,
                    "Store Name" : details[0].store.store_name,
                    "Views": details.length,
                    "City": details[0].store?.store_addresses[0]?.city || "NA",
                    "State": address?.address?.state || "NA",
                    "Country":address?.address?.country || "NA",
                })
                total["Views"] += details.length; 
            }
            datas.push(total)
            datas.push({});
        }

        const __ADMIN = await Admin.findOne({where: {id: admin_id}});

        const buffer = createXLSXfile([{
            sheetName: "Analytics",
            data: datas
        }]);
        
        await sendXLSXEmail(__ADMIN.email, 'Analytics reports', 'analytics_reports.xlsx', buffer, 'Please refer to the attached Analytics Reports Excel Sheet')

        return {
            is_email_sent: true
        }

    }catch(err) {
        throw err;
    }
}



const admin_listStoreTransactions = async function(data, admin_id) {
    // data = {stores, from, to}
    // stores = [{store_id}]
    try{
        const {stores, from, to} = data;
        const buffer = await listStoreTransactionReports({stores, from, to})

        const __ADMIN = await Admin.findOne({where: {id: admin_id}});
        await sendXLSXEmail(__ADMIN.email, 'Transaction report', 'transactions.xlsx', buffer, 'Please refer to the attached Transactions Reports Excel Sheet')

        return {
            is_email_sent: true
        }

    }catch(err) {
        throw err;
    }
}



const user_listStoreTransactions = async function(data, user_id) {
    // data = {stores, from, to}
    try{
        let {stores, from, to} = data;
        if(stores.length == 0) {
            const ownerStores = await Store.findAll({
                include: [
                    {
                        model: StoreUser,
                        where: {user_id, is_store_owner: true, status: 'active'}
                    }
                ]
            })
            stores = ownerStores.map(s => {return {store_id: s.id}})
        }
        const buffer = await listStoreTransactionReports({stores, from, to})

        const __USER = await User.findOne({where: {id: user_id}});
        await sendXLSXEmail(__USER.email, 'Transaction report', 'transactions.xlsx', buffer, 'Please refer to the attached Store Reports Excel Sheet')

        return {
            is_email_sent: true
        }
    }catch(err) {
        throw err;
    }
}



const admin_listFinancialReports = async function(data, admin_id) {
    // data = {stores, from_date, to_date}
    try{
        const {stores, from_date, to_date} = data;
        const buffer = await listCompleteTransactions({stores, from_date, to_date})

        const __ADMIN = await Admin.findOne({where: {id: admin_id}});
        await sendXLSXEmail(__ADMIN.email, 'Financial report', 'financials.xlsx', buffer, 'Please refer to the attached Financial Reports Excel Sheet')

        return {
            is_email_sent: true
        }
    }catch(err) {
        // logger.log(err);
    }
}



module.exports = {
    user_listStoreReports, admin_listStoreReports, admin_listWatchUsersList,
    admin_listStoreTransactions, user_listStoreTransactions, admin_listFinancialReports,

}