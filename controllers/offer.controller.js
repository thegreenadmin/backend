const { Op } = require("sequelize");
const moment = require('moment');
const sequelize = global['sequelize'];

const Product = require("../models/catalogue/product.model");
const Offer = require("../models/offer/offer.model");
const OfferProduct = require("../models/offer/offer_product.model");
const Country = require("../models/state/country.model");
const State = require("../models/state/state.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const StoreUser = require("../models/store/store_users.model");

const CatalogueController = require("./catalogue.controller");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");
const MessageController = require("./message.controller");
const User = require("../models/user/user.model");
const Membership = require("../models/transaction/membership.model");
const MembershipPlan = require("../models/transaction/membership_plan.model");
const logger = require("../logger/logger");



const createStoreOffer = async function (data) {
    // data = {store_id, offer, offer_products}
    // offer = {is_offer_for_store, offer_name, image_url, offer_type, offer_value}
    // offer_products = [{product_id}]
    const __SQL_TRANSACTION = await sequelize.transaction();
    try {
        const { offer, offer_products, store_id } = data;

        if(offer.is_offer_for_store) {
            const __ANY_STORE_OFFER = await Offer.findOne({
                where: {store_id, is_offer_for_store: offer.is_offer_for_store, is_expired: false, status: 'active'}
            })

            if(__ANY_STORE_OFFER) {
                throw `Can not create offer for store as '${__ANY_STORE_OFFER.offer_name}' is already applied for the store`;
            }

        }

        const __OFFER = await Offer.create({
            store_id,
            auto_created: false,
            is_offer_for_store: offer.is_offer_for_store,
            offer_name: offer.offer_name,
            image_url: offer.image_url,
            offer_type: offer.offer_type,
            offer_value: offer.offer_value,
            is_expired: false,
            status: 'active'
        }, {
            transaction: __SQL_TRANSACTION
        });

        if (!offer.is_offer_for_store) {

            if(!offer_products.length) {
                throw "Please select atleast one product";
            }

            const __PRODUCTS = await Product.findAll({
                where: {store_id, id: {[Op.in]: offer_products.map(op => op.product_id) }, status: 'active'}
            })

            if(__PRODUCTS.length != offer_products.length) {
                throw "Selected products are not avialable to apply offer."
            }

            const __OFFER_PRODUCTS = await OfferProduct.bulkCreate(
                offer_products.map(({ product_id }) => {
                    return {
                        product_id,
                        offer_id: __OFFER.id,
                        status: 'active'
                    }
                }),
                { transaction: __SQL_TRANSACTION }
            )
        }else {
            const __PRODUCTS = await Product.findAll({where: {store_id: __OFFER.store_id, status: 'active'}});

            // if(!__PRODUCTS.length) {
            //     throw "No products are available in the store. Please add products first!"
            // }
        }

        await MessageController.createOfferMessageHeadsAndNotification(store_id, __OFFER.id, __OFFER.offer_name, __OFFER.image_url, __SQL_TRANSACTION);

        await __SQL_TRANSACTION.commit();
        return { offer_id: __OFFER.id }
    } catch (err) {
        await __SQL_TRANSACTION.rollback();
        throw err;
    }
}




const listStoreOffers = async function (data, user_id) {
    //data = {store_id, page, page_size, order_by, order_type, filters}
    try {
        let { store_id, page, page_size, order_by, order_type, filters } = data;
        order_by = order_by == 'offer_id' ? 'id' : order_by;
        const order = [
            (order_by && order_type) ? [order_by, order_type] : ['id', 'DESC']
        ]

        const store = (!store_id) ? {} : { store_id };
        const whereObj = CommonController.getFiltersFromArray(filters, 'offer_id');

        const __STORES = await Store.findAll(
            {
                where: { status: 'active' },
                include: [
                    {
                        model: StoreUser,
                        required: true,
                        where: { ...store, user_id, is_verified: true, status: 'active' },
                        attributes: []
                    }
                ]
            }
        )

        if (!__STORES.length) {
            return { offers: [] }
        }

        const query = {
            where: {
                ...whereObj,
                store_id: {
                    [Op.in]: __STORES.map(store => store.id)
                },
                status: 'active'
            },
            attributes: [
                ['id', 'offer_id'], 'store_id',
                'is_offer_for_store', 'offer_name', 'image_url', 'offer_type',
                'offer_value', 'is_expired', 'expiredAt'
            ],
            include: [
                {
                    model: Store,
                    required: true,
                    where: { status: 'active' },
                    attributes: [
                        ['id', 'store_id'],
                        'store_name', 'logo_url'
                    ],
                    include: [
                        {
                            model: StoreAddress,
                            required: false,
                            where: { status: 'active' },
                            attributes: [
                                ['id', 'store_address_id'],
                                'address_name', 'longitude', 'latitude',
                                'address_line_1', 'address_line_2',
                                'landmark', 'city'
                            ],
                            include: [
                                {
                                    model: State,
                                    required: false,
                                    attributes: [
                                        ['id', 'state_id'],
                                        'state_name'
                                    ],
                                    include: [
                                        {
                                            model: Country,
                                            required: false,
                                            attributes: [
                                                ['id', 'country_id'],
                                                'country_name'
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        const __OFFERS = await CommonController.getPaginationResult(
            {
                Model: Offer, query, page, page_size, order, as: 'data'
            }
        )

        return {
            total_count: __OFFERS.total_count,
            offers: __OFFERS.data.map(o => {
                const offer = o.toJSON();
                const offerImage = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
                delete offer.image_url;
                const storeLogoImage = S3Controller.getAwsS3SignedFileUrl(offer.store.logo_url);
                delete offer.store.logo_url;

                const __STORE = Object.assign({ logo: storeLogoImage }, offer.store);
                delete offer.store;
                const __OFFER = Object.assign({ image: offerImage }, offer);
                __OFFER.store = __STORE

                return __OFFER

            })
        };
    } catch (err) {
        throw err;
    }
}





const getStoreOfferDetails = async function (data) {
    // data = {store_id, offer_id}
    try {
        const { store_id, offer_id } = data;
        const __OFFER = await Offer.findOne(
            {
                where: { id: offer_id, store_id, status: 'active' },
                attributes: [
                    ['id', 'offer_id'],
                    'is_offer_for_store', 'offer_name', 'image_url', 'offer_type',
                    'offer_value', 'is_expired', 'expiredAt', 'createdAt'
                ],
                include: [
                    {
                        model: OfferProduct,
                        required: false,
                        where: { status: 'active' },
                        attributes: [
                            ['id', 'offer_product_id'],
                            'product_id', 'status'
                        ],
                        include: [
                            {
                                model: Product,
                                required: false,
                                // where: { store_id, status: 'active' },
                            }
                        ]
                    },
                    {
                        model: Store,
                        where: { id: store_id, status: 'active' },
                        attributes: [
                            ['id', 'store_id'],
                            'store_name'
                        ]
                    }
                ]
            }
        )

        if (!__OFFER) {
            throw "Offer not found";
        }

        const offer = __OFFER.toJSON();

        if (offer?.offer_products && Array.isArray(offer?.offer_products)) {
            Array.from(offer.offer_products).forEach((offerProduct) => {
                const product = offerProduct.product;
                delete offerProduct.product;

                const product_id = product.id;
                const image = S3Controller.getAwsS3SignedFileUrl(product.image_url);
                delete product.id;
                delete product.image_url;

                offerProduct.product = Object.assign({ product_id, image }, product);

            })
        }


        const image = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
        delete offer.image_url
        return Object.assign({ image }, offer);
    } catch (err) {
        throw err;
    }
}






const listNonOfferProductsForStore = async function (data) {
    //data = { q, store_id, page, page_size, order_by, order_type, category_id, filters }
    try {
        let { q, store_id, page, page_size, order_by, order_type, category_id, filters } = data;
        const __ANY_OFFER_FOR_STORE = await Offer.findOne(
            { where: { store_id, is_offer_for_store: true, is_expired: false, status: 'active' } }
        )

        if (__ANY_OFFER_FOR_STORE) {
            return { products: [] }
        }

        const __OFFERED_PRODUCTS = await Product.findAll(
            {
                where: { store_id, status: 'active' },
                include: [
                    {
                        model: OfferProduct,
                        attributes: [
                            ['id', 'offer_product_id'],
                            'status'
                        ],
                        where: { status: 'active' }
                    }
                ]
            }
        )

        filters.push({
            filter_by: 'product_id',
            filter_value: __OFFERED_PRODUCTS.map((product) => product.id),
            operation: 'notIn'
        })

        return await CatalogueController.listStoreProducts(
            { q, store_id, page, page_size, order_by, order_type, category_id, filters }
        );

    } catch (err) {
        throw err;
    }
}





const editStoreOffer = async function (data) {
    // data = {store_id, offer, offer_products}
    // offer = { offer_id, offer_name, image_url, offer_value, is_expired}
    // offer_products = [{offer_product_id, product_id, status}]
    const __SQL_TRANSACTION = await sequelize.transaction();
    try {
        const { store_id, offer, offer_products } = data;
        const expiredAt = (offer.is_expired == true) ? { expiredAt: moment().utc() } : {};

        const __OFFER = await Offer.findOne({where: {id: offer.offer_id, store_id}});

        if(!__OFFER) {
            throw "Offer not editable"
        }

        if(__OFFER.auto_created) {
            throw "Can not edit the auto generated offer"
        }

        const __UPDATE_STORE_OFFER = await Offer.update(
            {
                offer_name: offer.offer_name,
                image_url: offer.image_url,
                offer_value: offer.offer_value,
                is_expired: offer.is_expired,
                ...expiredAt
            },
            {
                where: { id: offer.offer_id, store_id, status: 'active' }
            }
        );

        await CommonController.bulkCreateUpdateDelete(
            OfferProduct,
            offer_products.map(oProduct => { return { ...oProduct, offer_id: offer.offer_id } }),
            'offer_product_id',
            { offer_id: offer.offer_id },
            __SQL_TRANSACTION
        )

        await __SQL_TRANSACTION.commit();
        return { is_updated: true };
    } catch (err) {
        await __SQL_TRANSACTION.rollback();
        throw err;
    }
}






const deleteStoreOffer = async function (data) {
    // data = {store_id, offer_id}
    const __SQL_TRANSACTION = await sequelize.transaction();
    try {
        const { store_id, offer_id } = data;

        const __OFFER = await Offer.findOne({
            where: {id: offer_id}
        })

        if(__OFFER.auto_created) {
            const __OFFER_PRODUCTS = await OfferProduct.findAll({
                where: {offer_id}
            })

            await Product.update({
                discount_value: 0
            }, {
                where: {id: {[Op.in] : __OFFER_PRODUCTS.map(op => op.product_id)}},
                transaction: __SQL_TRANSACTION
            })

        }


        const __DELETE_OFFER = await Offer.update(
            { status: 'deleted' },
            {
                where: { id: offer_id, store_id },
                transaction: __SQL_TRANSACTION
            }
        )
        if (!__DELETE_OFFER[0]) {
            throw "Offer not deleted";
        }

        const __DELETE_OFFER_PRODUCTS = await OfferProduct.update(
            { status: 'deleted' },
            {
                where: { offer_id },
                transaction: __SQL_TRANSACTION
            }
        )

        await __SQL_TRANSACTION.commit();
        return { is_deleted: true };

    } catch (err) {
        await __SQL_TRANSACTION.rollback();
        throw err;
    }
}


























/**
 * ////////////////////////////
 * /////////--SHOP--///////////
 * ////////////////////////////
 */
const shop_listAllStoresOffers = async function (data) {
    // data = {longitude, latitude, mileage, page, page_size}
    try {
        const { longitude, latitude, mileage, page, page_size } = data;

        const distanceAttribute =
            (latitude && longitude && mileage) ? ([[
                sequelize.literal(`
                3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                )
                `),
                "distance"
            ]]) : [];

        const distanceWhere =
            (latitude && longitude && mileage) ? ([
                sequelize.literal(`
                    3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                    ) <= ${mileage}
                `)
            ]) : {};

        const query = {
            attributes: [
                ['id', 'store_id'],
                'logo_url', 'store_name', 'is_verified', 'is_enabled'
            ],
            where: {
                status: 'active',
                is_enabled: true,
            },
            include: [
                {
                    model: StoreAddress,
                    required: true,
                    attributes: [
                        ['id', 'store_address_id'],
                        'address_name', 'longitude', 'latitude',
                        'address_line_1', 'address_line_2',
                        'landmark', 'city', 'postal_code',
                        ...distanceAttribute
                    ],
                    where: [
                        {
                            [Op.and]: [
                                {
                                    status: 'active',
                                },
                                ...distanceWhere
                            ]
                        }
                    ]
                },
                {
                    model: Offer,
                    required: true,
                    where: {
                        is_expired: false,
                        // expiredAt: {[Op.lte] : moment().toDate()},
                        status: 'active'
                    },
                    attributes: [
                        ['id', 'offer_id'],
                        'is_offer_for_store', 'offer_name', 'image_url', 'offer_type',
                        'offer_value', 'is_expired', 'expiredAt'
                    ]
                }
            ]
        }


        const __STORES = await CommonController.getPaginationResult(
            { Model: Store, query, page, page_size, order: [[Offer, sequelize.col("createdAt"), "DESC"]], as: 'data' }
        )
        // return __STORE_ADDRESSES.data;
        const stores = __STORES.data.map((__STORE) => {
            const store = __STORE.toJSON();
            const logo = S3Controller.getAwsS3SignedFileUrl(store.logo_url);
            store.offers = store.offers.map(offer => {
                const offerImage = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
                delete offer.image_url;
                return Object.assign({ image: offerImage }, offer);
            })

            delete store.logo_url;
            return Object.assign({ logo }, store);
        })

        return { total_count: __STORES.total_count, stores };

    } catch (err) {
        throw err;
    }
}


const shop_listStoreOffers = async function (store_id, isShowProducts = false) {
    try {

        const includeProducts = isShowProducts ? [
            {
                model: OfferProduct,
                required: false,
                where: { status: 'active' },
                attributes: ['product_id'],
                include: [
                    {
                        model: Product,
                        required: false,
                        where: { is_enabled: true, status: 'active' },
                        attributes: []
                    }
                ]
            }
        ] : [];

        const __OFFERS = await Offer.findAll(
            {
                where: { store_id, is_expired: false, status: 'active' },
                attributes: [
                    ['id', 'offer_id'],
                    'is_offer_for_store', 'store_id', 'offer_name', 'image_url', 'offer_type', 'offer_value',
                    'is_expired', 'createdAt', 'status'
                ],
                include: [
                    ...includeProducts
                ]
            }
        )


        const offers = __OFFERS.map((__OFFER) => {
            const offer = __OFFER.toJSON();
            const image = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
            delete offer.image_url;

            return Object.assign({ image }, offer);
        })


        return { offers };

    } catch (err) {
        throw err;
    }
}



const shop_listHomeOffers = async function (data) {
    // data = {longitude, latitude, mileage, page, page_size}
    try {
        const { longitude, latitude, mileage, page, page_size } = data;

        const distanceWhere =
            (latitude && longitude && mileage) ? ([
                sequelize.literal(`
                    3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                    ) <= ${mileage}
                `)
            ]) : {};

        const __ACTIVE_MEMBER_STORES = await Store.findAll({
            where: {status: 'active'},
            include: [
                {
                    model: Membership,
                    where: {expiredAt: {[Op.gte]: moment().utc().toDate()}},
                    include: [
                        {
                            model: MembershipPlan,
                            where: {[Op.or]: [
                                {plan_type: 'store'},
                                {plan_type: 'combo'}
                            ], status: 'active'}
                        }
                    ]
                }
            ]
        })

        const whereStores = __ACTIVE_MEMBER_STORES.length ? {
            id: {[Op.in] : __ACTIVE_MEMBER_STORES.map(s => {s = s.toJSON(); return s.id;})}
        } : {};

        if(!whereStores) {
            const __STORES = await Store.findAll({
                where: {
                    status: 'active'
                },
                include: [
                    {
                        model: StoreAddress,
                        where: [
                            {
                                [Op.and]: [
                                    {
                                        status: 'active',
                                    },
                                    ...distanceWhere
                                ]
                            }
                        ]
                    }
                ]
            })

            if(__STORES.length) {
                whereStores = {
                    whereStores: {[Op.in] : __STORES.map(s => {s = s.toJSON(); return s.id;})}
                }
            }
        }

            const distanceAttribute =
            (latitude && longitude && mileage) ? ([[
                sequelize.literal(`
                3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                )
                `),
                "distance"
            ]]) : [];

        const query = {
            where: {
                is_expired: false,
                status: 'active'
            },
            attributes: [
                ['id', 'offer_id'], 'store_id',
                'is_offer_for_store', 'offer_name', 'image_url', 'offer_type',
                'offer_value', 'is_expired', 'expiredAt'
            ],
            include: [
                {
                    model: Store,
                    where: {
                        ...whereStores,
                        status: 'active',
                        is_enabled: true,
                    },
                    include: [
                        {
                            model: StoreAddress,
                            where: {
                                [Op.and]: distanceWhere,
                                // status: 'active'
                            }
                        },
                    ]
                }
            ]
        }


        const __OFFERS = await CommonController.getPaginationResult({Model: Offer, query, page, page_size, order: [[sequelize.col("id"), "DESC"]], as: 'data'})
        
        const offers = __OFFERS.data.map(o => {
            const offer = o.toJSON();
            const offerImage = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
            const offer_id = offer.id;
            delete offer.image_url;
            delete offer.id;
            return Object.assign({ image: offerImage, offer_id }, offer);
        })

        return {total_count: __OFFERS.total_count, offers}
    } catch (err) {
        throw err;
    }
}

























module.exports = {
    createStoreOffer, listStoreOffers, getStoreOfferDetails,
    listNonOfferProductsForStore, editStoreOffer, deleteStoreOffer,
    shop_listAllStoresOffers, shop_listStoreOffers, shop_listHomeOffers,

}