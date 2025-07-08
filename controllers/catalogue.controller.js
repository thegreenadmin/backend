const sequelize = global["sequelize"];
const ExcelJS = require("exceljs");
const moment = require("moment");

const { ValidationError, Op, Sequelize } = require("sequelize");
const logger = require("../logger/logger");
const CartItem = require("../models/cart/cart_item.model");

const Category = require("../models/catalogue/category.model");
const FavouriteProduct = require("../models/catalogue/favourite_product.model");
const PreviousProduct = require("../models/catalogue/previous_product.model");
const Product = require("../models/catalogue/product.model");
const ProductCategory = require("../models/catalogue/product_category.model");
const ProductContent = require("../models/catalogue/product_content.model");
const ProductImage = require("../models/catalogue/product_image.model");
const ProductLink = require("../models/catalogue/product_link.model");
const ProductReview = require("../models/catalogue/product_review.model");
const ProductVisitor = require("../models/catalogue/product_visitor.model");
const QuantityType = require("../models/catalogue/quantity_type.model");
const Offer = require("../models/offer/offer.model");
const OfferProduct = require("../models/offer/offer_product.model");
const Order = require("../models/order/order.model");
const OrderItem = require("../models/order/order_item.model");
const PreviousStore = require("../models/store/previous_store.model");
const Store = require("../models/store/store.model");
const StoreAddress = require("../models/store/store_address.model");
const StoreUser = require("../models/store/store_users.model");
const Membership = require("../models/transaction/membership.model");
const MembershipPlan = require("../models/transaction/membership_plan.model");
const User = require("../models/user/user.model");
const CommonController = require("./common.controller");
const S3Controller = require("./s3.controller");
const StoreController = require("./store.controller");
const USPSController = require("./usps.controller");

const listQuantityTypes = async function () {
  try {
    const __QUANTITY_TYPES = await QuantityType.findAll({
      where: { status: "active" },
      attributes: [["id", "quantity_type_id"], "quantity_type_name"],
    });

    return { quantity_types: __QUANTITY_TYPES };
  } catch (err) {
    throw err;
  }
};

const createCategory = async function (data) {
  // data = {store_id, parent_category_id, category_name, image_url}
  try {
    const {
      store_id,
      parent_category_id,
      category_name,
      image_url,
      is_featured_category,
    } = data;
    const __CAREGORY = await Category.create({
      store_id,
      parent_category_id,
      category_name,
      image_url,
      is_featured_category,
      status: "active",
    });
    return { category_id: __CAREGORY.id };
  } catch (err) {
    if (err.message == ValidationError) {
      throw "Category already exists";
    }
    throw err;
  }
};

const listCategories = async function (data, is_enabled = null) {
  try {
    // data = {store_id, is_featured_category}
    const { store_id, is_featured_category } = data;
    const featuredCategory =
      is_featured_category == null || is_featured_category == undefined
        ? {}
        : { is_featured_category };

    const whereEnabled = is_enabled == null ? {} : { is_enabled };

    const __CAREGORIES = await Category.findAll({
      where: { store_id, ...featuredCategory, status: "active" },
      order: [
        ["is_featured_category", "DESC"],
        ["category_name", "ASC"],
      ],
      include: [
        {
          model: ProductCategory,
          where: { status: "active" },
          required: false,
          attributes: ["id", "category_id"],
          include: [
            {
              model: Product,
              required: is_enabled ? true : false,
              // attributes: [],
              where: { ...whereEnabled, status: "active" },
            },
          ],
        },
      ],
    });

    return {
      categories: __CAREGORIES.map((category) => {
        return {
          category_id: category.id,
          parent_category_id: category.parent_category_id,
          is_featured_category: category.is_featured_category,
          category_name: category.category_name,
          image: S3Controller.getAwsS3SignedFileUrl(category.image_url),
          total_products: category.product_categories.filter((pc) => pc.product)
            .length,
        };
      }),
    };
  } catch (err) {
    throw err;
  }
};

const getCategoryDetails = async function (data) {
  // data = {store_id, category_id}
  try {
    const { store_id, category_id } = data;
    const __CATEGORY = await Category.findOne({
      where: { id: category_id, store_id, status: "active" },
      attributes: [
        ["id", "category_id"],
        "category_name",
        "image_url",
        "is_featured_category",
      ],
    });

    if (!__CATEGORY) {
      throw "Category not found";
    }

    const category = __CATEGORY.toJSON();
    const image = S3Controller.getAwsS3SignedFileUrl(category.image_url);
    delete category.image_url;
    category.image = image;

    return { category };
  } catch (err) {
    throw err;
  }
};

const editCategory = async function (data) {
  // data = {store_id, cateogory_id, parent_category_id, category_name, image_url}
  try {
    const {
      store_id,
      category_id,
      parent_category_id,
      category_name,
      image_url,
      is_featured_category,
    } = data;
    const __CAREGORY = await Category.update(
      {
        store_id,
        parent_category_id,
        category_name,
        image_url,
        is_featured_category,
        status: "active",
      },
      {
        where: {
          id: category_id,
          store_id,
          parent_category_id,
          status: "active",
        },
      }
    );
    return { category_id: __CAREGORY.id };
  } catch (err) {
    throw err;
  }
};

const deleteCategory = async function (data) {
  // data = {store_id, category_id}
  try {
    const { store_id, category_id } = data;
    const __DELETE_CATEGORY = await Category.update(
      { status: "deleted" },
      { where: { id: category_id, store_id } }
    );

    if (!__DELETE_CATEGORY[0]) {
      throw "Category not belongs to the store";
    }

    const __PRODUCTS = await Product.findAll({
      where: { status: "active" },
      include: [
        {
          model: ProductCategory,
          where: { category_id, status: "active" },
        },
      ],
    });

    if (__PRODUCTS.length > 0) {
      for (let i = 0; i < __PRODUCTS.length; i++) {
        const product = __PRODUCTS[i];
        await deleteProduct({ product_id: product.id, store_id });
      }
    }

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const createProduct = async function (data) {
  // data = {store_id, product, product_categories, product_images, product_contents, product_links}

  // product = {quantity_type_id, quantity, is_featured_product, product_name,
  //              description, product_price, selling_price, discount_type, discount_value,
  //              is_product_returnable, return_days_count, length, width, height, weight, is_enabled}

  // product_categories = [{category_id}]

  // product_images = [{image_url, order}]

  // product_contents = [{heading, paragraph, order}]

  // product_links = [{name, link, order}]
  const __SQL_TRANSACTION = await sequelize.transaction();

  try {
    const {
      store_id,
      product,
      product_categories,
      product_images,
      product_contents,
      product_links,
    } = data;

    if (product.product_price <= 0 || product.selling_price <= 0) {
      throw "Price can not be less than 0";
    }

    const __PRODUCT = await Product.create(
      {
        store_id: store_id,
        quantity_type_id: product.quantity_type_id,
        quantity: product.quantity,
        is_featured_product: product.is_featured_product,
        product_name: product.product_name,
        description: product.description,
        product_price: product.product_price,
        selling_price: product.selling_price,
        discount_type: product.discount_type,
        discount_value: product.discount_value,
        is_product_returnable: product.is_product_returnable,
        return_days_count: product.return_days_count,
        length: product.length,
        width: product.width,
        height: product.height,
        weight: product.weight,
        is_enabled: product.is_enabled,
        status: "active",
      },
      {
        transaction: __SQL_TRANSACTION,
      }
    );

    const __PRODUCT_CATEGORIES = await ProductCategory.bulkCreate(
      product_categories.map((category) => {
        return { ...category, product_id: __PRODUCT.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    const __PRODUCT_IMAGES = await ProductImage.bulkCreate(
      product_images.map((img) => {
        return { ...img, product_id: __PRODUCT.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    const __PRODUCT_CONTENTS = await ProductContent.bulkCreate(
      product_contents.map((content) => {
        return { ...content, product_id: __PRODUCT.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    const __PRODUCT_LINKS = await ProductLink.bulkCreate(
      product_links.map((links) => {
        return { ...links, product_id: __PRODUCT.id, status: "active" };
      }),
      { transaction: __SQL_TRANSACTION }
    );

    if (parseInt(product.discount_value) > 0) {
      const __STORE = await Store.findOne({ where: { id: store_id } });

      const offerName =
        product.discount_type == "percentage"
          ? `${product.discount_value}% off on ${product.product_name}`
          : `$${product.discount_value} off on ${product.product_name}`;

      const __OFFER = await Offer.create(
        {
          store_id,
          auto_created: true,
          is_offer_for_store: false,
          offer_name: offerName,
          image_url: product_images.length
            ? product_images[0].image_url
            : __STORE.image_url,
          offer_type: product.discount_type,
          offer_value: product.discount_value,
          is_expired: false,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );

      const __OFFER_PRODUCT = await OfferProduct.create(
        {
          offer_id: __OFFER.id,
          product_id: __PRODUCT.id,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    await __SQL_TRANSACTION.commit();
    return { product_id: __PRODUCT.id };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const listStoreProducts = async function (
  data,
  user_id = null,
  showFavouriteProducts = null,
  showPreviousProducts = null,
  offer_id = null
) {
  // data = { q, store_id, page, page_size, order_by, order_type, category_id, filters }
  // filters = [{filter_by, filter_value, operation}]
  try {
    let {
      q,
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      category_id,
      filters,
    } = data;
    order_by = order_by == "product_id" ? "id" : order_by;
    const order = [
      order_by && order_type ? [order_by, order_type] : ["id", "DESC"],
    ];
    const productCategory = category_id ? { category_id } : {};
    const category = category_id == null ? {} : { id: category_id };

    const filterObj = CommonController.getFiltersFromArray(
      filters,
      "product_id"
    );
    const store = store_id
      ? typeof store_id == "object"
        ? store_id
        : { store_id }
      : {};

    const favouriteProductJoin = user_id
      ? [
          {
            model: FavouriteProduct,
            required:
              showFavouriteProducts != null ? showFavouriteProducts : false,
            where: { user_id, status: "active" },
            attributes: [["id", "favourite_product_id"], "status"],
          },
        ]
      : [];

    const previosOrderedProducts =
      showPreviousProducts && user_id
        ? await OrderItem.findAll({
            where: { status: "active" },
            include: [
              {
                model: Order,
                where: { ...store, user_id, status: "active" },
              },
            ],
          })
        : null;

    const previousProductJoin =
      previosOrderedProducts == null
        ? {}
        : previosOrderedProducts.length == 0
        ? { id: null }
        : {
            id: { [Op.in]: previosOrderedProducts.map((oi) => oi.product_id) },
          };

    let offerJoinQuery = [];

    const whereEnabled = user_id ? { is_enabled: true } : {};

    if (offer_id) {
      const __OFFER = await Offer.findOne({
        where: { id: offer_id, store_id, is_expired: false, status: "active" },
      });
      if (__OFFER) {
        if (!__OFFER.is_offer_for_store) {
          offerJoinQuery = [
            {
              model: OfferProduct,
              required: true,
              attributes: [],
              where: { offer_id, status: "active" },
            },
          ];
        }
      }
    }

    const query = {
      where: {
        product_name: { [Op.iLike]: q + "%" },
        ...store,
        ...filterObj,
        ...whereEnabled,
        ...previousProductJoin,
        status: "active",
      },
      include: [
        {
          model: Store,
          attributes: [],
          where: { ...whereEnabled, status: "active" },
        },
        {
          model: QuantityType,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "quantity_type_id"],
            "quantity_type_name",
            "status",
          ],
        },
        {
          model: ProductCategory,
          where: { ...productCategory, status: "active" },
          required: category_id ? true : false,
          attributes: [["id", "product_category_id"], "category_id", "status"],
          include: [
            {
              model: Category,
              required: false,
              attributes: [["id", "category_id"], "category_name"],
              where: { status: "active" },
            },
          ],
        },
        {
          model: ProductImage,
          where: { status: "active" },
          required: false,
          order: [["order", "ASC"]],
          attributes: [
            ["id", "product_image_id"],
            "image_url",
            "order",
            "status",
          ],
        },
        {
          model: ProductContent,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "product_content_id"],
            "heading",
            "paragraph",
            "order",
            "status",
          ],
        },
        ...favouriteProductJoin,
        ...offerJoinQuery,
      ],
    };

    const __PRODUCTS = await CommonController.getPaginationResult({
      Model: Product,
      query,
      page,
      page_size,
      order,
      as: "data",
    });

    const products = __PRODUCTS.data.map((p) => {
      let product = Object.assign(
        {
          product_id: p.id,
        },
        p.toJSON()
      );

      if (user_id) {
        const is_favourite_product = product?.favourite_products?.length
          ? true
          : false;
        const is_previous_product = product?.previous_products?.length
          ? true
          : false;
        product = Object.assign(
          {
            product_id: p.id,
            is_favourite_product,
            is_previous_product,
          },
          p.toJSON()
        );
      } else if (
        showPreviousProducts != null ||
        showFavouriteProducts != null
      ) {
        product = Object.assign(
          {
            product_id: p.id,
            is_favourite_product: false,
            is_previous_product: false,
          },
          p.toJSON()
        );
      }
      delete product.id;
      delete product.quantity_type_id;
      delete product?.favourite_products;
      delete product?.previous_products;

      product.product_categories = product?.product_categories?.filter(
        (pc) => pc.category
      );
      product.product_images = product.product_images.map((img) => {
        const image = S3Controller.getAwsS3SignedFileUrl(img.image_url);
        delete img.image_url;
        img.image = image;
        return img;
      });

      return product;
    });
    return { total_count: __PRODUCTS.total_count, products };
  } catch (err) {
    throw err;
  }
};

const listStoreUserProducts = async function (data, user_id) {
  // data = { q, store_id, page, page_size, order_by, order_type, category_id, filters }
  // filters = [{filter_by, filter_value, operation}]
  try {
    const {
      q,
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      category_id,
      filters,
    } = data;
    const stores = await (await StoreController.getUserStores(user_id)).stores;
    return listStoreProducts({
      ...data,
      store_id: store_id
        ? store_id
        : stores.length
        ? { store_id: { [Op.in]: stores.map((store) => store.store_id) } }
        : { store_id: null },
    });
  } catch (err) {
    throw err;
  }
};

const getProduct = async function (
  store_id,
  product_id,
  user_id = null,
  show_reviews = false,
  show_offer = false
) {
  try {
    const favouriteProduct = user_id
      ? [
          {
            model: FavouriteProduct,
            required: false,
            where: { product_id, user_id, status: "active" },
          },
        ]
      : [];

    const cartItem = user_id
      ? [
          {
            model: CartItem,
            required: false,
            where: { user_id, product_id, status: "active" },
            attributes: [["id", "cart_item_id"], "items_count"],
          },
        ]
      : [];

    const productReviews = show_reviews
      ? [
          {
            model: ProductReview,
            required: false,
            order: [["id", "DESC"]],
            attributes: {
              include: [["id", "product_review_id"]],
              exclude: ["id"],
            },
            where: { status: "active" },
            include: [
              {
                model: User,
                required: false,
                where: { status: "active" },
              },
            ],
          },
        ]
      : [];

    const __PRODUCT = await Product.findOne({
      where: { id: product_id, store_id, status: "active" },
      attributes: {
        include: [["id", "product_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: QuantityType,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "quantity_type_id"],
            "quantity_type_name",
            "status",
          ],
        },
        {
          model: ProductCategory,
          where: { status: "active" },
          required: false,
          attributes: [["id", "product_category_id"], "status"],
          include: [
            {
              model: Category,
              required: false,
              attributes: [["id", "category_id"], "category_name"],
              where: { status: "active" },
            },
          ],
        },
        {
          model: ProductImage,
          where: { status: "active" },
          required: false,
          order: [["order", "ASC"]],
          attributes: [
            ["id", "product_image_id"],
            "image_url",
            "order",
            "status",
          ],
        },
        {
          model: ProductContent,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "product_content_id"],
            "heading",
            "paragraph",
            "order",
            "status",
          ],
        },
        {
          model: ProductLink,
          where: { status: "active" },
          required: false,
          attributes: [
            ["id", "product_link_id"],
            "name",
            "link",
            "order",
            "status",
          ],
        },
        ...favouriteProduct,
        ...cartItem,
        ...productReviews,
      ],
    });

    if (!__PRODUCT) {
      throw "Product not found";
    }

    const product = __PRODUCT.toJSON();

    product.product_images.forEach((img) => {
      const image = S3Controller.getAwsS3SignedFileUrl(img.image_url);
      delete img.image_url;
      img.image = image;
    });

    if (user_id) {
      const is_favourite_product = product.favourite_products.length
        ? true
        : false;
      delete product.favourite_products;
      product.is_favourite_product = is_favourite_product;
    }

    if (show_reviews) {
      const __PRODUCT_RATINGS = await ProductReview.findAll({
        where: { product_id, status: "active" },
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("rating")), "average_rating"],
        ],
      });

      const average_rating = __PRODUCT_RATINGS[0]
        ? __PRODUCT_RATINGS[0].toJSON().average_rating
        : 0;
      product.average_rating = average_rating;
    }

    if (show_offer) {
      let offer = null;

      const __OFFERS = await Offer.findAll({
        where: { store_id, is_expired: false, status: "active" },
        attributes: [
          ["id", "offer_id"],
          "is_offer_for_store",
          "offer_name",
          "image_url",
          "offer_type",
          "offer_value",
        ],
        include: [
          {
            model: OfferProduct,
            required: false,
          },
        ],
      });

      const offers = [];
      const __STORE_ONLY_OFFER = __OFFERS.find((offer) => {
        return offer.is_offer_for_store == true;
      });

      if (__STORE_ONLY_OFFER) {
        const image = S3Controller.getAwsS3SignedFileUrl(
          __STORE_ONLY_OFFER.image_url
        );
        const __OFFER__ = Object.assign({ image }, __STORE_ONLY_OFFER.toJSON());
        delete __OFFER__.image_url;
        delete __OFFER__.offer_products;

        offers.push(__OFFER__);
      }
      for (let i = 0; i < __OFFERS.length; i++) {
        const offer = __OFFERS[i];
        const __OFFER_PRODUCT = offer.offer_products.find((offerProduct) => {
          const productId = product.id ? product.id : product.product_id;
          return productId == offerProduct.product_id;
        });

        if (__OFFER_PRODUCT) {
          const image = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
          const __OFFER__ = Object.assign({ image }, offer.toJSON());
          delete __OFFER__.image_url;
          delete __OFFER__.offer_products;
          offers.push(__OFFER__);
        }
      }

      let maxDiscount = 0;
      for (let i = 0; i < offers.length; i++) {
        const discountOffset = CommonController.getCalculateOffset(
          product.selling_price,
          offers[0].offer_type,
          offers[0].offer_value
        );
        if (discountOffset > maxDiscount) {
          maxDiscount = discountOffset;
          offer = offers[i];
        }
      }

      if (offer) {
        product.offer_price = CommonController.getCalculatedPrice(
          product.selling_price,
          offer.offer_type,
          offer.offer_value
        );
      } else {
        product.offer_price = CommonController.getCalculatedPrice(
          product.selling_price,
          product.discount_type,
          product.discount_value
        );
      }
      product.offer = offer;
    }

    return { product };
  } catch (err) {
    throw err;
  }
};

const editProduct = async function (data) {
  // data = {store_id, product, product_categories, product_images, product_contents, product_links}

  // product = {product_id, quantity_type_id, quantity, is_featured_product, product_name,
  //              description, product_price, selling_price, discount_type, discount_value,
  //              is_product_returnable, return_days_count, length, width, height, weight, is_enabled}

  // product_categories = [{product_category_id, category}]

  // category = {category_id}

  // product_images = [{product_image_id,image_url, order}]

  // product_contents = [{product_content_id, heading, paragraph, order}]

  // product_links = [{product_link_id, name, link, order}]
  const __SQL_TRANSACTION = await sequelize.transaction();

  try {
    const {
      store_id,
      product,
      product_categories,
      product_images,
      product_contents,
      product_links,
    } = data;
    const {
      product_id,
      quantity_type_id,
      quantity,
      is_featured_product,
      product_name,
      description,
      product_price,
      selling_price,
      discount_type,
      discount_value,
      is_product_returnable,
      return_days_count,
      length,
      width,
      height,
      weight,
      is_enabled,
    } = product;
    const __PRODUCT = await Product.findOne({
      where: { id: product.product_id, store_id, status: "active" },
    });

    if (!__PRODUCT) {
      throw "Store product not found";
    }

    const __UPDATE_PRODUCT = await Product.update(
      {
        quantity_type_id,
        quantity,
        is_featured_product,
        product_name,
        description,
        product_price,
        selling_price,
        discount_type,
        discount_value,
        is_product_returnable,
        return_days_count,
        length,
        width,
        height,
        weight,
        is_enabled,
      },
      {
        where: { id: product_id, store_id, status: "active" },
        transaction: __SQL_TRANSACTION,
      }
    );

    // Bulk Create/Update/Delete ProductCategories
    await CommonController.bulkCreateUpdateDelete(
      ProductCategory,
      product_categories.map((pCategory) => {
        pCategory.category_id = pCategory.category.category_id;
        return { ...pCategory, product_id };
      }),
      "product_category_id",
      { product_id },
      __SQL_TRANSACTION
    );

    const __PRODUCT_IMAGES = await ProductImage.findAll({
      where: { product_id },
    });

    // Bulk Create/Update/Delete ProductImages
    await CommonController.bulkCreateUpdateDelete(
      ProductImage,
      product_images.map((image) => {
        return { ...image, product_id };
      }),
      "product_image_id",
      { product_id },
      __SQL_TRANSACTION
    );

    // Bulk Create/Update/Delete ProductContents
    await CommonController.bulkCreateUpdateDelete(
      ProductContent,
      product_contents.map((content) => {
        return { ...content, product_id };
      }),
      "product_content_id",
      { product_id },
      __SQL_TRANSACTION
    );

    // Bulk Create/Update/Delete ProductLinks
    await CommonController.bulkCreateUpdateDelete(
      ProductLink,
      product_links.map((link) => {
        return { ...link, product_id };
      }),
      "product_link_id",
      { product_id },
      __SQL_TRANSACTION
    );

    const __OFFER = await Offer.findOne({
      where: { is_expired: false, status: "active" },
      include: [
        {
          model: OfferProduct,
          where: { product_id, status: "active" },
        },
      ],
    });

    if (parseInt(discount_value) > 0) {
      if (__OFFER && __OFFER.auto_created) {
        const __STORE = await Store.findOne({ where: { id: store_id } });

        const offerName =
          product.discount_type == "percentage"
            ? `${product.discount_value}% off on ${product.product_name}`
            : `$${product.discount_value} off on ${product.product_name}`;

        await Offer.update(
          {
            offer_name: offerName,
            image_url: __PRODUCT_IMAGES.find(
              (pi) => pi.status == "active" && pi.order == 1
            )
              ? __PRODUCT_IMAGES.find(
                  (pi) => pi.status == "active" && pi.order == 1
                ).image_url
              : __STORE.image_url,
          },
          {
            where: { id: __OFFER.id },
            transaction: __SQL_TRANSACTION,
          }
        );
      } else if (!__OFFER) {
        const __STORE = await Store.findOne({ where: { id: store_id } });

        const offerName =
          product.discount_type == "percentage"
            ? `${product.discount_value}% off on ${product.product_name}`
            : `$${product.discount_value} off on ${product.product_name}`;

        const __OFFER = await Offer.create(
          {
            store_id,
            auto_created: true,
            is_offer_for_store: false,
            offer_name: offerName,
            image_url: product_images.length
              ? product_images[0].image_url
              : __STORE.image_url,
            offer_type: product.discount_type,
            offer_value: product.discount_value,
            is_expired: false,
            status: "active",
          },
          {
            transaction: __SQL_TRANSACTION,
          }
        );

        const __OFFER_PRODUCT = await OfferProduct.create(
          {
            offer_id: __OFFER.id,
            product_id: __PRODUCT.id,
            status: "active",
          },
          {
            transaction: __SQL_TRANSACTION,
          }
        );
      }
    } else {
      if (__OFFER && __OFFER.auto_created) {
        const __DELETE_OFFER = await Offer.update(
          { status: "deleted" },
          {
            where: { id: __OFFER.id },
            transaction: __SQL_TRANSACTION,
          }
        );
        if (!__DELETE_OFFER[0]) {
          throw "Offer not deleted";
        }

        const __DELETE_OFFER_PRODUCTS = await OfferProduct.update(
          { status: "deleted" },
          {
            where: { offer_id: __OFFER.id },
            transaction: __SQL_TRANSACTION,
          }
        );
      }
    }

    await __SQL_TRANSACTION.commit();
    return { is_updated: true };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

const deleteProduct = async function (data) {
  // data = {product_id, store_id}
  try {
    const { product_id, store_id } = data;

    const __OFFER = await Offer.findOne({
      where: { is_expired: false, status: "active" },
      include: [
        {
          model: OfferProduct,
          where: { product_id },
        },
      ],
    });

    if (__OFFER) {
      await Offer.update(
        {
          status: "deleted",
        },
        {
          where: { id: __OFFER.id },
        }
      );

      await OfferProduct.update(
        {
          status: "deleted",
        },
        {
          where: { offer_id: __OFFER.id, product_id },
        }
      );
    }

    const __DELETE_PRODUCT = await Product.update(
      { status: "deleted" },
      { where: { id: product_id, store_id } }
    );
    if (!__DELETE_PRODUCT[0]) {
      throw "Product not belongs to store";
    }
    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

/**
 * ////////////////////////////
 * /////////--SHOP--///////////
 * ////////////////////////////
 */
const shop_listStoreCategories = async function (data) {
  try {
    return await listCategories(data, true);
  } catch (err) {
    throw err;
  }
};

const shop_listStoreProducts = async function (data, user_id = null) {
  // data = { q, store_id, page, page_size, order_by, order_type, category_id, offer_id, filters, is_favourite_products, is_previous_products }
  // filters = [{filter_by, filter_value, operation}]
  try {
    const {
      q,
      store_id,
      page,
      page_size,
      order_by,
      order_type,
      category_id,
      offer_id,
      filters,
      is_favourite_products,
      is_previous_products,
    } = data;

    const store = store_id
      ? typeof store_id == "object"
        ? store_id
        : { store_id }
      : {};

    const __PRODUCTS = await listStoreProducts(
      {
        q,
        store_id,
        page,
        page_size,
        order_by,
        order_type,
        category_id,
        filters,
      },
      user_id,
      is_favourite_products,
      is_previous_products,
      offer_id
    );

    const __OFFERS = await Offer.findAll({
      where: { ...store, is_expired: false, status: "active" },
      attributes: [
        ["id", "offer_id"],
        "is_offer_for_store",
        "offer_name",
        "image_url",
        "offer_type",
        "offer_value",
      ],
      include: [
        {
          model: OfferProduct,
          required: false,
        },
      ],
    });

    __PRODUCTS.products.forEach((product) => {
      if (__OFFERS.length == 0) {
        product.offer_price = CommonController.getCalculatedPrice(
          product.selling_price,
          product.discount_type,
          product.discount_value
        );

        return (product.offer = null);
      }

      const offers = [];
      const __STORE_ONLY_OFFER = __OFFERS.find((offer) => {
        return offer.is_offer_for_store == true;
      });

      if (__STORE_ONLY_OFFER) {
        const image = S3Controller.getAwsS3SignedFileUrl(
          __STORE_ONLY_OFFER.image_url
        );
        const __OFFER__ = Object.assign({ image }, __STORE_ONLY_OFFER.toJSON());
        delete __OFFER__.image_url;
        delete __OFFER__.offer_products;

        offers.push(__OFFER__);
      }
      for (let i = 0; i < __OFFERS.length; i++) {
        const offer = __OFFERS[i];
        const __OFFER_PRODUCT = offer.offer_products.find((offerProduct) => {
          const productId = product.id ? product.id : product.product_id;
          return productId == offerProduct.product_id;
        });

        if (__OFFER_PRODUCT) {
          const image = S3Controller.getAwsS3SignedFileUrl(offer.image_url);
          const __OFFER__ = Object.assign({ image }, offer.toJSON());
          delete __OFFER__.image_url;
          delete __OFFER__.offer_products;
          offers.push(__OFFER__);
        }
      }

      let offer;

      let maxDiscount = 0;
      for (let i = 0; i < offers.length; i++) {
        const discountOffset = CommonController.getCalculateOffset(
          product.selling_price,
          offers[i].offer_type,
          offers[i].offer_value
        );
        if (discountOffset > maxDiscount) {
          maxDiscount = discountOffset;
          offer = offers[i];
        }
      }

      if (offer) {
        product.offer_price = CommonController.getCalculatedPrice(
          product.selling_price,
          offer.offer_type,
          offer.offer_value
        );
        return (product.offer = offer);
      }

      // if nothing matches then set offer_price as selling_price
      product.offer_price = product.selling_price;
      product.offer = null;
    });

    return __PRODUCTS;
  } catch (err) {
    throw err;
  }
};

const shop_getProductDetails = async function (
  data,
  product_id,
  user_id = null
) {
  // data = {store_id, longitude, laititude}
  try {
    // add product view
    const { store_id, longitude, latitude } = data;

    const __PRODUCT = await getProduct(
      store_id,
      product_id,
      user_id,
      true,
      true
    );

    if (longitude && latitude && user_id) {
      const address = await USPSController.getAddressUsingLatLong(
        latitude,
        longitude
      );
      if (address.result && address.address) {
        await ProductVisitor.create({
          user_id,
          product_id,
          longitude,
          latitude,
          status: "active",
          address: address.full_address,
          city: address.address.city || address.address.town,
          state: address.address.state,
          country: address.address.country,
        });
      }
    }

    if (user_id) {
      const __PREVIOUS_STORE = await PreviousStore.findOne({
        where: { store_id, user_id, status: "active" },
      });

      if (__PREVIOUS_STORE) {
        await PreviousStore.update(
          { count: __PREVIOUS_STORE.count + 1 },
          { where: { id: __PREVIOUS_STORE.id } }
        );
      } else {
        await PreviousStore.create({
          count: 1,
          user_id,
          store_id,
          status: "active",
        });
      }

      const __PREVIOUS_PRODUCT = await PreviousProduct.findOne({
        where: { product_id, user_id, status: "active" },
      });

      if (__PREVIOUS_PRODUCT) {
        await PreviousProduct.update(
          { count: __PREVIOUS_PRODUCT.count + 1 },
          { where: { id: __PREVIOUS_PRODUCT.id } }
        );
      } else {
        await PreviousProduct.create({
          count: 1,
          user_id,
          product_id,
          status: "active",
        });
      }
    }

    return __PRODUCT;
  } catch (err) {
    throw err;
  }
};

const shop_listAppHomeProducts = async function (data, user_id = null) {
  // data = {page, page_size, order_by, order_type, longitude, latitude, mileage}
  try {
    const {
      page,
      page_size,
      order_by,
      order_type,
      longitude,
      latitude,
      mileage,
    } = data;

    // logger.log({page, page_size, order_by, order_type, longitude, latitude, mileage})

    const distanceWhere =
      latitude && longitude && mileage
        ? [
            sequelize.literal(`
                    3959 * acos(
                    cos(radians(${latitude})) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(${longitude})) +
                    sin(radians(${latitude})) *
                    sin(radians(latitude))
                    ) <= ${parseInt(mileage)}
                `),
          ]
        : [];
    const getStores = await StoreAddress.findAll({
      where: [
        {
          [Op.and]: [
            {
              status: "active",
            },
            ...distanceWhere,
          ],
        },
      ],
    });
    const storeIds = getStores.map((item) => item.id);

    //return storeIds
    const __ACTIVE_MEMBER_STORES = await Store.findAll({
      where: {
        status: "active",
        id: {
          [Op.in]: storeIds,
        },
      },
      include: [
        {
          model: Membership,
          //where: {expiredAt: {[Op.gte]: moment().utc().toDate()}},
          include: [
            {
              model: MembershipPlan,
              where: {
                [Op.or]: [
                  { plan_type: "product" },
                  { plan_type: { [Op.in]: ["store", "product", "combo"] } },
                ],
                status: "active",
              },
            },
          ],
        },
        {
          model: StoreAddress,
          where: [
            {
              [Op.and]: [
                {
                  status: "active",
                },
                ...distanceWhere,
              ],
            },
          ],
        },
      ],
    });

    let store_id = __ACTIVE_MEMBER_STORES.length
      ? {
          store_id: {
            [Op.in]: __ACTIVE_MEMBER_STORES.map((s) => {
              s = s.toJSON();
              return s.id;
            }),
          },
        }
      : null;

    if (!store_id) {
      const __STORES = await Store.findAll({
        where: {
          status: "active",
        },
        include: [
          {
            model: StoreAddress,
            where: [
              {
                [Op.and]: [
                  {
                    status: "active",
                  },
                  ...distanceWhere,
                ],
              },
            ],
          },
        ],
      });

      if (__STORES.length) {
        store_id = {
          store_id: {
            [Op.in]: __STORES.map((s) => {
              s = s.toJSON();
              return s.id;
            }),
          },
        };
      }
    }

    // return __ACTIVE_MEMBER_STORES.length

    const filters = [
      {
        filter_by: "is_featured_product",
        filter_value: true,
        operation: "eq",
      },
    ];

    return await shop_listStoreProducts(
      {
        q: "",
        store_id,
        page,
        page_size,
        order_by,
        order_type,
        category_id: null,
        filters: filters,
        is_favourite_products: null,
        is_previous_products: null,
      },
      user_id
    );
  } catch (err) {
    throw err;
  }
};

// admin
// admin
// admin
// admin
// admin
// admin
const admin_listCategories = async function (data) {
  // data = {stores, q, page, page_size, order_by, order_type}
  // stores = [{store_id}]
  try {
    const { stores, q, page, page_size, order_by, order_type } = data;

    const whereStores = stores.length
      ? { store_id: stores.map((s) => s.store_id) }
      : {};
    const order =
      order_by && order_type
        ? [[order_by == "category_id" ? "id" : order_by, order_type]]
        : [["id", "DESC"]];

    const query = {
      where: {
        ...whereStores,
        category_name: { [Op.iLike]: `%${q}%` },
        status: "active",
      },
      attributes: {
        include: [["id", "category_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          where: { status: "active" },
          attributes: [["id", "store_id"], "store_name"],
        },
        {
          model: ProductCategory,
          where: { status: "active" },
          required: false,
          attributes: ["id", "category_id"],
          include: [
            {
              model: Product,
              required: false,
              attributes: [],
              where: { status: "active" },
            },
          ],
        },
      ],
    };

    const __CATEGORIES = await CommonController.getPaginationResult({
      Model: Category,
      query,
      order,
      page,
      page_size,
      as: "data",
    });

    const categories = __CATEGORIES.data.map((c) => {
      const category = c.toJSON();
      return {
        category_id: category.category_id,
        is_featured_category: category.is_featured_category,
        category_name: category.category_name,
        image: S3Controller.getAwsS3SignedFileUrl(category.image_url),
        store: category.store,
        total_products: category.product_categories.length,
      };
    });

    return { total_count: __CATEGORIES.total_count, categories };
  } catch (err) {
    throw err;
  }
};

const admin_listProducts = async function (data) {
  //  q, store_id, page, page_size, order_by, order_type }
  try {
    const { q, stores, page, page_size, order_by, order_type } = data;

    const order =
      order_by && order_type
        ? [[order_by == "product_id" ? "id" : order_by, order_type]]
        : [["id", "DESC"]];

    const whereStore = stores.length ? { store_id: { [Op.in]: stores } } : {};
    const query = {
      where: {
        product_name: { [Op.iLike]: `%${q}%` },
        status: "active",
        ...whereStore,
      },
      attributes: {
        include: [["id", "product_id"]],
        exclude: ["id"],
      },
      include: [
        {
          model: Store,
          where: { status: "active" },
          attributes: {
            include: [["id", "store_id"]],
            exclude: ["id"],
          },
        },
      ],
    };

    return await CommonController.getPaginationResult({
      Model: Product,
      query,
      order,
      page,
      page_size,
      as: "products",
    });
  } catch (err) {
    throw err;
  }
};

const admin_bulkCreateProducts = async function (data, file) {
  // data = {store_id}
  const __SQL_TRANSACTION = await sequelize.transaction();
  try {
    const { store_id } = data;
    const __QUANTITY_TYPES = await QuantityType.findAll({
      where: { status: "active" },
    });
    const __CATEGORIES = await Category.findAll({
      where: { store_id, status: "active" },
    });
    const storeCaregories = __CATEGORIES.map((c) => c.toJSON());
    const workbook = new ExcelJS.Workbook();
    const xl = await workbook.xlsx.load(file.buffer);
    const datas = [];
    const columns = [];
    const worksheet = workbook.getWorksheet(1);

    for (let i = 0; i < worksheet.rowCount; i++) {
      const row = worksheet.getRow(i + 1);
      const data = {
        product: {
          store_id,
          quantity_type_id: 1,
          quantity: 0,
          is_featured_product: false,
          product_name: "",
          description: "",
          product_price: 0,
          selling_price: 0,
          discount_type: "amount",
          discount_value: 0,
          is_product_returnable: false,
          return_days_count: 0,
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
          is_enabled: false,
          status: "active",
        },
        product_categories: [
          {
            category_id: null,
            status: "active",
          },
        ],
        product_images: [
          { image_url: null, order: 1, status: "active" },
          { image_url: null, order: 2, status: "active" },
          { image_url: null, order: 3, status: "active" },
          { image_url: null, order: 4, status: "active" },
          { image_url: null, order: 5, status: "active" },
        ],
        product_contents: [
          { heading: null, paragraph: null, order: 1, status: "active" },
          { heading: null, paragraph: null, order: 2, status: "active" },
          { heading: null, paragraph: null, order: 3, status: "active" },
          { heading: null, paragraph: null, order: 4, status: "active" },
          { heading: null, paragraph: null, order: 5, status: "active" },
        ],
        product_links: [
          { name: null, link: null, order: 1, status: "active" },
          { name: null, link: null, order: 2, status: "active" },
          { name: null, link: null, order: 3, status: "active" },
          { name: null, link: null, order: 4, status: "active" },
          { name: null, link: null, order: 5, status: "active" },
        ],
      };

      for (let j = 0; j < row.cellCount; j++) {
        const cell = row.getCell(j + 1);

        if (cell.row == "1") {
          columns.push(cell.value);
          continue;
        }
        const colName = columns[cell.col - 1];
        const currentRow = cell.row;

        if (colName == "Name") data.product.product_name = cell.value;
        if (colName == "Quantity Type") {
          let _qt = null;
          __QUANTITY_TYPES.forEach((qt) => {
            if (qt.quantity_type_name == cell.value) {
              _qt = qt;
            }
          });
          if (_qt) {
            data.product.quantity_type_id = _qt.id;
          }
        }

        //data.product.quantity_type_id = __QUANTITY_TYPES.find((qt) => {qt.quantity_type_name == cell.value}).quantity_type_id;
        if (colName == "Quantity") data.product.quantity = cell.value;
        if (colName == "Featured Product")
          data.product.is_featured_product = cell.value == "0" ? false : true;
        if (colName == "Description") data.product.description = cell.value;
        if (colName == "Price") {
          data.product.product_price = cell.value;
          data.product.selling_price = cell.value;
          if (parseInt(cell.value) <= 0) {
            throw `Product '${data.product.product_name}' price can not be less than 0`;
          }
        }
        if (colName == "Discount Type")
          data.product.discount_type =
            cell.value == "percentage" ? "percentage" : "amount";
        if (colName == "Discount") data.product.discount_value = cell.value;
        if (colName == "Is Returnable")
          data.product.is_product_returnable = cell.value == "0" ? false : true;
        if (colName == "Return Days")
          data.product.return_days_count = cell.value;
        if (colName == "Length") data.product.length = cell.value;
        if (colName == "Width") data.product.width = cell.value;
        if (colName == "Height") data.product.height = cell.value;
        if (colName == "Weight") data.product.weight = cell.value;
        if (colName == "Is Enabled")
          data.product.is_enabled = cell.value == "0" ? false : true;

        if (colName == "Category") {
          let _c = null;
          storeCaregories.forEach((c) => {
            if (c.category_name.toLowerCase() == cell.value.toLowerCase()) {
              _c = c;
            }
          });

          if (_c) {
            data.product_categories[0].category_id = _c.id;
          } else {
            const __CATEGORY = await Category.create({
              store_id,
              parent_category_id: null,
              category_name: cell.value,
              is_featured_category: false,
              status: "active",
            });
            storeCaregories.push(__CATEGORY.toJSON());
            data.product_categories[0].category_id = __CATEGORY.id;
          }
        }

        if (colName == "Heading 1")
          data.product_contents[0].heading = cell.value;
        if (colName == "Heading 2")
          data.product_contents[1].heading = cell.value;
        if (colName == "Heading 3")
          data.product_contents[2].heading = cell.value;
        if (colName == "Heading 4")
          data.product_contents[3].heading = cell.value;
        if (colName == "Heading 5")
          data.product_contents[4].heading = cell.value;

        if (colName == "Paragraph 1")
          data.product_contents[0].paragraph = cell.value;
        if (colName == "Paragraph 2")
          data.product_contents[1].paragraph = cell.value;
        if (colName == "Paragraph 3")
          data.product_contents[2].paragraph = cell.value;
        if (colName == "Paragraph 4")
          data.product_contents[3].paragraph = cell.value;
        if (colName == "Paragraph 5")
          data.product_contents[4].paragraph = cell.value;

        if (colName == "Link 1 Name") data.product_links[0].name = cell.value;
        if (colName == "Link 2 Name") data.product_links[1].name = cell.value;
        if (colName == "Link 3 Name") data.product_links[2].name = cell.value;
        if (colName == "Link 4 Name") data.product_links[3].name = cell.value;
        if (colName == "Link 5 Name") data.product_links[4].name = cell.value;

        if (colName == "Link 1 URL")
          data.product_links[0].link = cell.value?.hyperlink
            ? cell.value.hyperlink
            : cell.value;
        if (colName == "Link 2 URL")
          data.product_links[1].link = cell.value?.hyperlink
            ? cell.value.hyperlink
            : cell.value;
        if (colName == "Link 3 URL")
          data.product_links[2].link = cell.value?.hyperlink
            ? cell.value.hyperlink
            : cell.value;
        if (colName == "Link 4 URL")
          data.product_links[3].link = cell.value?.hyperlink
            ? cell.value.hyperlink
            : cell.value;
        if (colName == "Link 5 URL")
          data.product_links[4].link = cell.value?.hyperlink
            ? cell.value.hyperlink
            : cell.value;
      }
      if (row.number != 1) {
        datas.push(data);
      }
    }

    const workSheetImages = worksheet.getImages();
    for (let i = 0; i < workSheetImages.length; i++) {
      const image = workSheetImages[i];
      const img = workbook.model.media.find((m) => m.index === image.imageId);
      if (!img) continue;

      img.mimetype = img.type + "/" + img.extension;
      img.originalname = img.name + "." + img.extension;
      const s3Image = await S3Controller.uploadFile(img);

      const row = image.range.tl.nativeRow - 1;
      const col = image.range.tl.nativeCol - 17;

      if (datas[row] && datas[row].product_images[col]) {
        datas[row].product_images[col].image_url = s3Image.orignal_url;
      }
    }

    const __PRODUCTS = await Product.bulkCreate(
      datas.map((data) => data.product),
      { transaction: __SQL_TRANSACTION }
    );

    __PRODUCTS.forEach((product, index) => {
      const data = datas[index];
      data.product.product_id = product.id;
      data.product_images = data.product_images.map((p) => {
        return { ...p, product_id: product.id };
      });
      data.product_contents = data.product_contents.map((p) => {
        return { ...p, product_id: product.id };
      });
      data.product_links = data.product_links.map((p) => {
        return { ...p, product_id: product.id };
      });
      data.product_categories = data.product_categories.map((p) => {
        return { ...p, product_id: product.id };
      });
    });

    let createableCategories = [];
    let createableContents = [];
    let createableImages = [];
    let createableLinks = [];

    datas.forEach((data) => {
      createableCategories = [
        ...createableCategories,
        ...data.product_categories.filter((pc) => pc.category_id != null),
      ];
      createableContents = [
        ...createableContents,
        ...data.product_contents.filter(
          (pc) => pc.heading != null && pc.paragraph != null
        ),
      ];
      createableImages = [
        ...createableImages,
        ...data.product_images.filter((pc) => pc.image_url != null),
      ];
      createableLinks = [
        ...createableLinks,
        ...data.product_links.filter(
          (pc) => pc.name != null && pc.link != null
        ),
      ];
    });

    if (createableCategories.length) {
      await ProductCategory.bulkCreate(createableCategories, {
        transaction: __SQL_TRANSACTION,
      });
    }
    if (createableContents.length) {
      await ProductContent.bulkCreate(createableContents, {
        transaction: __SQL_TRANSACTION,
      });
    }
    if (createableImages.length) {
      await ProductImage.bulkCreate(createableImages, {
        transaction: __SQL_TRANSACTION,
      });
    }
    if (createableLinks.length) {
      await ProductLink.bulkCreate(createableLinks, {
        transaction: __SQL_TRANSACTION,
      });
    }

    // create offer for each product
    for (let i = 0; i < __PRODUCTS.length; i++) {
      const __STORE = await Store.findOne({ where: { id: store_id } });
      const product = __PRODUCTS[i];
      const data = datas[i];

      const offerName =
        product.discount_type == "percentage"
          ? `${product.discount_value}% off on ${product.product_name}`
          : `$${product.discount_value} off on ${product.product_name}`;

      const __OFFER = await Offer.create(
        {
          store_id,
          auto_created: true,
          is_offer_for_store: false,
          offer_name: offerName,
          image_url: data.product_images.length
            ? data.product_images[0].image_url
            : __STORE.image_url,
          offer_type: product.discount_type,
          offer_value: product.discount_value,
          is_expired: false,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );

      const __OFFER_PRODUCT = await OfferProduct.create(
        {
          offer_id: __OFFER.id,
          product_id: product.id,
          status: "active",
        },
        {
          transaction: __SQL_TRANSACTION,
        }
      );
    }

    await __SQL_TRANSACTION.commit();
    return { products: datas };
  } catch (err) {
    await __SQL_TRANSACTION.rollback();
    throw err;
  }
};

module.exports = {
  createCategory,
  editCategory,
  listCategories,
  getCategoryDetails,
  createProduct,
  deleteCategory,
  listStoreProducts,
  editProduct,
  getProduct,
  deleteProduct,
  listQuantityTypes,
  listStoreUserProducts,

  shop_listStoreCategories,
  shop_listStoreProducts,
  shop_getProductDetails,
  shop_listAppHomeProducts,

  admin_listCategories,
  admin_listProducts,
  admin_bulkCreateProducts,
};
