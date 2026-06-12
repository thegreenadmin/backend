const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const fs = require("fs");
const logger = require("../logger/logger");

const {
  createAdmin,
  loginAdmin,
  getAdminDetails,
  getDashsboardDetails,
  createForgotPasswordLink,
  verifyLinkAndCreateNewPassword,
  changePassword,
  updateAdminProfile,
  listMembershipUsers,
  membershipPlanUpdate,
  listDefaultRoles,
  getRoleDetails,
  updateRolePermissions,
  deleteAdmin,
  listAdmins,
} = require("../controllers/admin.controller");
const { adminAuth } = require("../controllers/auth.controller");
const {
  admin_listCountryFeatures,
  admin_updateCountryFeature,
  admin_assignHerbsLicensee,
  admin_revokeHerbsLicensee,
  admin_updateStoreType,
} = require("../controllers/feature.controller");
const {
  admin_listCategories,
  getCategoryDetails,
  createCategory,
  editCategory,
  deleteCategory,
  admin_listProducts,
  getProduct,
  createProduct,
  editProduct,
  deleteProduct,
  admin_bulkCreateProducts,
} = require("../controllers/catalogue.controller");
const {
  getOrderServiceCharge,
  updateDefaultTax,
} = require("../controllers/common.controller");
const {
  admin_listNotifications,
  admin_unreadNotificationCount,
} = require("../controllers/notification.controller");
const {
  admin_listOrders,
  orderDetails,
  admin_saveOrderServiceCharge,
} = require("../controllers/order.controller");
const {
  listPages,
  getPageDetails,
  createPage,
  updatePage,
  deletePage,
} = require("../controllers/page.controller");
const {
  admin_listStores,
  getStoreDetails,
  editStoreDetails,
  deleteStore,
  createStore,
  admin_listClaimStoreRequests,
  admin_claimStoreDetails,
  admin_acceptClaimRequest,
  admin_rejectClaimRequest,
  admin_deleteClaimRequest,
  admin_listStoreServiceCharges,
  admin_getServiceCharges,
  admin_createServiceCharge,
  admin_updateServiceCharge,
  admin_deleteServiceCharge,
  admin_bulkCreateStore,
  admin_getDefaultServiceCharge,
  admin_getDefaultStoreServiceCharge,
  admin_verifyStore,
} = require("../controllers/store.controller");
const {
  admin_listUsers,
  admin_userDetails,
  admin_blockUser,
  admin_removeBlockUser,
} = require("../controllers/user.controller");
const { STORE_CREATED_SUCCESSFULLY } = require("../utils/messages.util");
const {
  sendCreatedResponse,
  sendConflictResponse,
  sendUnauthorizedResponse,
  sendOkResponse,
} = require("../utils/response.util");
const {
  listContactQueries,
  deleteContactQuery,
  getContactQuery,
  replyContactQuery,
} = require("../controllers/contact.controller");
const {
  admin_listStoreReports,
  admin_listWatchUsersList,
  admin_listStoreTransactions,
  admin_listFinancialReports,
} = require("../controllers/report.controller");

/**
 * @swagger
 * /api/v1/admin/create:
 *   post:
 *     summary: Create a new admin user
 *     description: Creates a new admin account with email, password, and name. Requires admin authentication.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password
 *               name:
 *                 type: string
 *                 description: Admin full name
 *     responses:
 *       201:
 *         description: Admin successfully created
 *       409:
 *         description: Conflict - Admin already exists or validation error
 */
router.post("/create", adminAuth, async function (req, res) {
  const { email, password, name } = req.body;
  try {
    const admin = await createAdmin({ email, password, name });
    if (admin) {
      sendCreatedResponse(res, {}, "Admin successfully created!");
    }
  } catch (e) {
    sendConflictResponse(res, {}, e);
  }
});

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates an admin user and returns a JWT token
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const token = await loginAdmin({ email, password });
    if (token) {
      sendCreatedResponse(res, { token: token }, "Admin successfully loginned");
    }
  } catch (e) {
    sendUnauthorizedResponse(res, {}, e);
  }
});

router.get("/details", adminAuth, async function (req, res) {
  const admin_id = req.payload.admin.id;
  try {    
    const admin = await getAdminDetails(admin_id);
    sendOkResponse(res, admin, "Admin details successfully fetched");
  } catch (err) {    
    sendConflictResponse(res, {}, err);
  }
});

router.put("/update", adminAuth, async function (req, res) {
  try {
    const updateAdmin = await updateAdminProfile(
      req.body,
      req.payload.admin.id
    );
    sendOkResponse(res, updateAdmin, "Admin details successfully updated");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/delete", adminAuth, async function (req, res) {
  try {
    const updateAdmin = await deleteAdmin(req.body);
    sendOkResponse(res, updateAdmin, "Admin successfully removed");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/list", adminAuth, async function (req, res) {
  try {
    const updateAdmin = await listAdmins();
    sendOkResponse(res, updateAdmin, "Admin list successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//password
router.post("/forgot/password/link/create", async function (req, res) {
  try {
    const forgotLink = await createForgotPasswordLink(req.body);
    sendOkResponse(
      res,
      forgotLink,
      "Forgot password link sent to registered email"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/forgot/password/create", async function (req, res) {
  try {
    const forgotPassword = await verifyLinkAndCreateNewPassword(req.body);
    sendCreatedResponse(
      res,
      forgotPassword,
      "New password created successfully"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

// change password
router.put("/password/change", adminAuth, async function (req, res) {
  try {
    const newPassword = await changePassword(req.body, req.payload.admin.id);
    sendCreatedResponse(res, newPassword, "New password created successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//dashboard
/**
 * @swagger
 * /api/v1/admin/dashboard/details:
 *   get:
 *     summary: Get admin dashboard
 *     description: Get platform-wide dashboard statistics and metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard details successfully fetched
 */
router.get("/dashboard/details", adminAuth, async function (req, res) {
  try {
    const dashboard = await getAdminDashboard();
    sendOkResponse(res, dashboard, "Dashboard details successfully fetched");
  } catch (e) {
    sendConflictResponse(res, {}, e);
  }
});

// users

/**
 * @swagger
 * /api/v1/admin/users/list:
 *   get:
 *     summary: List all users
 *     description: Get list of all platform users with pagination and filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users list fetched successfully
 */
router.get("/users/list", adminAuth, async function (req, res) {
  try {
    const users = await admin_listUsers(req.query);
    sendOkResponse(res, users, "Users list fetched successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

/**
 * @swagger
 * /api/v1/admin/user/details:
 *   get:
 *     summary: Get user details
 *     description: Get detailed information about a specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details successfully fetched
 */
router.get("/user/details", adminAuth, async function (req, res) {
  try {
    const user = await admin_getUserDetails(req.query.user_id);
    sendOkResponse(res, user, "User details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

/**
 * @swagger
 * /api/v1/admin/user/block/create:
 *   post:
 *     summary: Block user
 *     description: Block a user from the platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User successfully blocked
 */
router.post("/user/block/create", adminAuth, async function (req, res) {
  try {
    const store = await admin_blockUser(req.body);
    sendCreatedResponse(res, store, "User successfully blocked");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

/**
 * @swagger
 * /api/v1/admin/user/block/delete:
 *   delete:
 *     summary: Unblock user
 *     description: Unblock a user from the platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User successfully unblocked
 */
router.delete("/user/block/delete", adminAuth, async function (req, res) {
  try {
    const store = await admin_unblockUser(req.body);
    sendOkResponse(res, store, "User successfully unblocked");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//stores
//stores
//stores
//stores
//stores
//stores

router.post(
  "/store/bulk/create",
  adminAuth,
  upload.single("file"),
  async function (req, res) {
    try {
      // const { file } = req;
      if (!req.file) {
        throw "File not found";
      }
      const stores = await admin_bulkCreateStore(req.file);
      sendOkResponse(res, stores, "Stores successfully created");
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.put("/store/verify", adminAuth, async function (req, res) {
  try {
    const verification = await admin_verifyStore(req.body);
    sendOkResponse(res, verification, "Store successfully verified");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/store/create", adminAuth, async function (req, res) {
  try {
    const store = await createStore(req.body);
    sendCreatedResponse(res, store, STORE_CREATED_SUCCESSFULLY);
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

/**
 * @swagger
 * /api/v1/admin/store/list:
 *   get:
 *     summary: List all stores
 *     description: Get list of all platform stores with pagination and filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stores list fetched successfully
 */
router.get("/store/list", adminAuth, async function (req, res) {
  try {
    const stores = await admin_listStores(req.query);
    sendOkResponse(res, stores, "Stores list fetched successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/details", adminAuth, async function (req, res) {
  try {
    const store = await getStoreDetails(req.query.store_id, null, true);
    sendOkResponse(res, store, "Store details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/store/edit", adminAuth, async function (req, res) {
  try {
    const editStore = await editStoreDetails(req.body);
    sendOkResponse(res, editStore, "Store details updated successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/store/delete", adminAuth, async function (req, res) {
  try {
    const storeDelete = await deleteStore(req.body.store_id);
    sendOkResponse(res, storeDelete, "Store successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/claim/list", adminAuth, async function (req, res) {
  try {
    const claimRequests = await admin_listClaimStoreRequests(req.query);
    sendOkResponse(res, claimRequests, "Claim list successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store/claim/details", adminAuth, async function (req, res) {
  try {
    const claimRequest = await admin_claimStoreDetails(req.query);
    sendOkResponse(res, claimRequest, "Claim details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/store/claim/accept", adminAuth, async function (req, res) {
  try {
    const claimRequest = await admin_acceptClaimRequest(req.body);
    sendOkResponse(res, claimRequest, "Claim request successfully accepted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/store/claim/reject", adminAuth, async function (req, res) {
  try {
    const claimRequest = await admin_rejectClaimRequest(req.body);
    sendOkResponse(res, claimRequest, "Claim details successfully rejected");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/store/claim/delete", adminAuth, async function (req, res) {
  try {
    const claimRequest = await admin_deleteClaimRequest(req.body);
    sendOkResponse(res, claimRequest, "Claim details successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//categories
//categories
//categories
//categories
//categories
//categories
router.post("/category/list", adminAuth, async function (req, res) {
  try {
    const categoryList = await admin_listCategories(req.body);
    sendOkResponse(res, categoryList, "Category list successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/category/details", adminAuth, async function (req, res) {
  try {
    const category = await getCategoryDetails(req.query);
    sendOkResponse(res, category, "Category details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/category/create", adminAuth, async function (req, res) {
  try {
    const category = await createCategory(req.body);
    sendCreatedResponse(res, category, "Category created successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/category/edit", adminAuth, async function (req, res) {
  try {
    const category = await editCategory(req.body);
    sendCreatedResponse(res, category, "Category updated successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/category/delete", adminAuth, async function (req, res) {
  try {
    const category = await deleteCategory(req.body);
    sendCreatedResponse(res, category, "Category successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//product
//product
//product
//product
//product
//product

router.post("/product/list", adminAuth, async function (req, res) {
  try {
    const products = await admin_listProducts(req.body);
    sendCreatedResponse(res, products, "Products successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/product/details", adminAuth, async function (req, res) {
  try {
    const products = await getProduct(req.query.store_id, req.query.product_id);
    sendOkResponse(res, products, "Product details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/product/create", adminAuth, async function (req, res) {
  try {
    const product = await createProduct(req.body);
    sendCreatedResponse(res, product, "Product created successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/product/edit", adminAuth, async function (req, res) {
  try {
    const updateProduct = await editProduct(req.body);
    sendOkResponse(res, updateProduct, "Product updated successfully");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/product/delete", adminAuth, async function (req, res) {
  try {
    const deletedProduct = await deleteProduct(req.body);
    sendOkResponse(res, deletedProduct, "Product successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post(
  "/product/bulk/create",
  adminAuth,
  upload.single("file"),
  async function (req, res) {
    try {
      // const { file } = req;
      if (!req.file) {
        throw "File not found";
      }
      const products = await admin_bulkCreateProducts(req.body, req.file);
      sendOkResponse(res, products, "Products successfully created");
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

//orders
//orders
//orders
//orders
//orders
//orders
router.post("/order/list", adminAuth, async function (req, res) {
  try {
    const orders = await admin_listOrders(req.body);
    sendOkResponse(res, orders, "Orders successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/order/details", adminAuth, async function (req, res) {
  try {
    const order = await orderDetails(req.query);
    sendOkResponse(res, order, "User order details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});
//pages
//pages
//pages
//pages
//pages
//pages

router.post("/page/create", adminAuth, async function (req, res) {
  try {
    const page = await createPage(req.body);
    sendCreatedResponse(res, page, "Page successfully created");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/page/list", adminAuth, async function (req, res) {
  try {
    const pages = await listPages(req.query);
    sendOkResponse(res, pages, "Pages successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/page/details", adminAuth, async function (req, res) {
  try {
    const page = await getPageDetails(req.query);
    sendOkResponse(res, page, "Page details successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/page/edit", adminAuth, async function (req, res) {
  try {
    const page = await updatePage(req.body);
    sendCreatedResponse(res, page, "Page successfully updated");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/page/delete", adminAuth, async function (req, res) {
  try {
    const page = await deletePage(req.body);
    sendCreatedResponse(res, page, "Page successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//notification
router.get("/notification/list", adminAuth, async function (req, res) {
  try {
    const notifications = await admin_listNotifications(req.query);
    sendOkResponse(
      res,
      notifications,
      "Notification list successfully fetched"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/notification/unread/count", adminAuth, async function (req, res) {
  try {
    const notifications = await admin_unreadNotificationCount();
    sendOkResponse(
      res,
      notifications,
      "Notification unread count successfully fetched"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//store service charge
router.get("/store/service/charge/list", adminAuth, async function (req, res) {
  try {
    const serviceCharges = await admin_listStoreServiceCharges(req.query);
    sendOkResponse(
      res,
      serviceCharges,
      "Service charges list successfully fetched"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get(
  "/store/service/charge/details",
  adminAuth,
  async function (req, res) {
    try {
      const serviceCharges = await admin_getServiceCharges(req.query);
      sendOkResponse(
        res,
        serviceCharges,
        "Service charges details successfully fetched"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.get(
  "/store/service/charge/default/details",
  adminAuth,
  async function (req, res) {
    try {
      const serviceCharges = await admin_getDefaultStoreServiceCharge();
      sendOkResponse(
        res,
        serviceCharges,
        "Service charges details successfully fetched"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.post(
  "/store/service/charge/create",
  adminAuth,
  async function (req, res) {
    try {
      const serviceCharges = await admin_createServiceCharge(req.body);
      sendOkResponse(
        res,
        serviceCharges,
        "Service charges successfully create"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.put(
  "/store/service/charge/update",
  adminAuth,
  async function (req, res) {
    try {
      const serviceCharges = await admin_updateServiceCharge(req.body);
      sendOkResponse(
        res,
        serviceCharges,
        "Service charges successfully updated"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.delete(
  "/store/service/charge/delete",
  adminAuth,
  async function (req, res) {
    try {
      const serviceCharges = await admin_deleteServiceCharge(req.body);
      sendOkResponse(
        res,
        serviceCharges,
        "Service charges successfully deleted"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

//order service charge
router.get(
  "/order/service/charge/details",
  adminAuth,
  async function (req, res) {
    try {
      let orderServiceCharge = await getOrderServiceCharge();
      delete orderServiceCharge.id;
      sendOkResponse(
        res,
        orderServiceCharge,
        "Order service charge successfully fetched"
      );
    } catch (err) {
      sendConflictResponse(res, {}, err);
    }
  }
);

router.put("/order/service/charge/save", adminAuth, async function (req, res) {
  try {
    const orderServiceCharge = await admin_saveOrderServiceCharge(req.body);
    sendOkResponse(
      res,
      orderServiceCharge,
      "Order service charge successfully saved"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/contact/query/list", adminAuth, async function (req, res) {
  try {
    const contactQueies = await listContactQueries(req.query);
    sendOkResponse(
      res,
      contactQueies,
      "Contact query list successfully fetched"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/contact/query/details", adminAuth, async function (req, res) {
  try {
    const contactQueies = await getContactQuery(req.query);
    sendOkResponse(
      res,
      contactQueies,
      "Contact query details successfully fetched"
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/contact/query/delete", adminAuth, async function (req, res) {
  try {
    const contactQueies = await deleteContactQuery(req.body);
    sendOkResponse(res, contactQueies, "Query successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/contact/query/reply", adminAuth, async function (req, res) {
  try {
    const reply = await replyContactQuery(req.body);
    sendOkResponse(res, reply, "Reply successfully sent");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//memberships
router.get("/membership/list", adminAuth, async function (req, res) {
  try {
    const memberships = await listMembershipUsers(req.query);
    sendOkResponse(res, memberships, "Memberships list successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/membership/plan/update", adminAuth, async function (req, res) {
  try {
    const plan = await membershipPlanUpdate(req.body);
    sendOkResponse(res, plan, "Plan successfully updated");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//reports
router.get("/reports/store", adminAuth, async function (req, res) {
  try {
    const reports = await admin_listStoreReports(
      req.query,
      req.payload.admin.id
    );
    sendOkResponse(
      res,
      reports,
      "An email with report has sent to the registered email address."
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/reports/users", adminAuth, async function (req, res) {
  try {
    const data = await admin_listWatchUsersList(
      req.query,
      req.payload.admin.id
    );
    sendOkResponse(
      res,
      data,
      "An email with report has sent to the registered email address."
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/reports/store/transaction", adminAuth, async function (req, res) {
  try {
    const data = await admin_listStoreTransactions(
      req.body,
      req.payload.admin.id
    );
    sendOkResponse(
      res,
      data,
      "An email with report has sent to the registered email address."
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/reports/financial", adminAuth, async function (req, res) {
  try {
    const data = await admin_listFinancialReports(
      req.body,
      req.payload.admin.id
    );
    sendOkResponse(
      res,
      data,
      "An email with report has sent to the registered email address."
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

//tax
router.put("/tax/update", adminAuth, async function (req, res) {
  try {
    const data = await updateDefaultTax(req.body);
    sendOkResponse(res, data, "Tax successfully updated.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

// default roles and permissions
router.get("/roles/list", adminAuth, async function (req, res) {
  try {
    const defaultRoles = await listDefaultRoles();
    sendOkResponse(res, defaultRoles, "Default roles successfully fetched.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/roles/detail", adminAuth, async function (req, res) {
  try {
    const defaultRole = await getRoleDetails(req.query);
    sendOkResponse(
      res,
      defaultRole,
      "Default role details successfully fetched."
    );
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/roles/update", adminAuth, async function (req, res) {
  try {
    const data = await updateRolePermissions(req.body);
    sendOkResponse(res, data, "Default role details successfully updated.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

// ---------------------------------------------------------------------------
// Country feature gating (munchies / herbs / payments per country)
// ---------------------------------------------------------------------------

router.get("/country/features", adminAuth, async function (req, res) {
  try {
    const countries = await admin_listCountryFeatures();
    sendOkResponse(res, countries, "Country features successfully fetched.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/country/feature/update", adminAuth, async function (req, res) {
  try {
    const feature = await admin_updateCountryFeature(req.body);
    sendOkResponse(res, feature, "Country feature successfully updated.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/country/herbs/license/assign", adminAuth, async function (req, res) {
  try {
    const license = await admin_assignHerbsLicensee(req.body);
    sendOkResponse(res, license, "Herbs licensee successfully assigned.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/country/herbs/license/revoke", adminAuth, async function (req, res) {
  try {
    const result = await admin_revokeHerbsLicensee(req.body);
    sendOkResponse(res, result, "Herbs licensee successfully revoked.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.put("/store/type/update", adminAuth, async function (req, res) {
  try {
    const store = await admin_updateStoreType(req.body);
    sendOkResponse(res, store, "Store type successfully updated.");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

module.exports = { adminRouter: router };
