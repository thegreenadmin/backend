const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const Country = require("../models/state/country.model");
const CountryFeature = require("../models/state/country_feature.model");
const CountryHerbsLicense = require("../models/state/country_herbs_license.model");
const State = require("../models/state/state.model");
const StoreAddress = require("../models/store/store_address.model");
const { sendForbiddenResponse } = require("../utils/response.util");
const logger = require("../logger/logger");

const FEATURE_KEYS = ["munchies", "herbs", "payments"];

// Country resolution trusts call metadata only (per product decision), never
// the profile address: device SIM/region header first, then IP geolocation,
// then the account phone code. Returns a country row or null.
//
// The app sends `X-Device-Country` with the SIM/device region ISO2 code.
const resolveCallerCountry = async function (req, _res, next) {
  try {
    let iso2 = null;

    const deviceCountry = req.headers["x-device-country"];
    if (deviceCountry && /^[a-zA-Z]{2}$/.test(deviceCountry.trim())) {
      iso2 = deviceCountry.trim().toUpperCase();
    }

    if (!iso2) {
      const ip = (req.headers["x-forwarded-for"] || req.ip || "")
        .split(",")[0]
        .trim();
      const geo = ip ? geoip.lookup(ip) : null;
      if (geo && geo.country) {
        iso2 = geo.country;
      }
    }

    let country = null;
    if (iso2) {
      country = await Country.findOne({
        where: { abbrevation: iso2, status: "active" },
      });
    }

    // last resort: the account's phone code (ambiguous for shared codes
    // like +1, first active match wins)
    if (!country && req.payload && req.payload.user) {
      country = await Country.findOne({
        where: { phone_code: req.payload.user.phone_code, status: "active" },
      });
    }

    req.callerCountry = country;
    next();
  } catch (err) {
    // resolution failures must never break the request; gates fail closed
    logger.err("resolveCallerCountry failed: ", err);
    req.callerCountry = null;
    next();
  }
};

// Resolved feature map for a country. Unknown country fails closed for the
// regulated vertical (herbs) and open for the rest.
const getCountryFeatures = async function (countryId) {
  const features = { munchies: true, herbs: false, payments: true };
  if (!countryId) {
    return features;
  }

  features.herbs = true;
  const rows = await CountryFeature.findAll({
    where: { country_id: countryId, status: "active" },
    raw: true,
  });
  for (const row of rows) {
    if (FEATURE_KEYS.includes(row.feature_key)) {
      features[row.feature_key] = row.is_enabled;
    }
  }
  return features;
};

const isFeatureEnabled = async function (countryId, featureKey) {
  const features = await getCountryFeatures(countryId);
  return features[featureKey] === true;
};

// The licensed herbs provider for a country, or null.
const getHerbsLicensee = async function (countryId) {
  if (!countryId) {
    return null;
  }
  return CountryHerbsLicense.findOne({
    where: { country_id: countryId, status: "active" },
  });
};

const isHerbsLicensee = async function (userId, countryId) {
  const license = await getHerbsLicensee(countryId);
  return !!license && Number(license.user_id) === Number(userId);
};

// Country of a store, derived from its address -> state -> country. Used for
// write-path enforcement (the store's own country, not the caller's).
const getStoreCountryId = async function (storeId) {
  const address = await StoreAddress.findOne({
    where: { store_id: storeId, status: "active" },
    include: [{ model: State }],
  });
  return address && address.state ? address.state.country_id : null;
};

// Route middleware factory: blocks the request when the feature is disabled
// for the caller's country. Mount after userAuth + resolveCallerCountry.
const featureGate = function (featureKey) {
  return async function (req, res, next) {
    try {
      const countryId = req.callerCountry ? req.callerCountry.id : null;
      const enabled = await isFeatureEnabled(countryId, featureKey);
      if (!enabled) {
        return sendForbiddenResponse(
          res,
          {},
          "This feature is not available in your country"
        );
      }
      next();
    } catch (err) {
      logger.err("featureGate failed: ", err);
      sendForbiddenResponse(res, {}, "This feature is not available in your country");
    }
  };
};

// ---------------------------------------------------------------------------
// Admin panel management
// ---------------------------------------------------------------------------

// Countries with their resolved feature map and current herbs licensee.
const admin_listCountryFeatures = async function () {
  const User = require("../models/user/user.model");
  const countries = await Country.findAll({
    where: { status: "active" },
    attributes: [["id", "country_id"], "country_name", "abbrevation"],
    order: [["country_name", "ASC"]],
    raw: true,
  });
  const featureRows = await CountryFeature.findAll({
    where: { status: "active" },
    raw: true,
  });
  const licenses = await CountryHerbsLicense.findAll({
    where: { status: "active" },
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email", "phone"],
      },
    ],
  });

  const featureMap = {};
  for (const row of featureRows) {
    featureMap[row.country_id] = featureMap[row.country_id] || {};
    featureMap[row.country_id][row.feature_key] = row.is_enabled;
  }
  const licenseMap = {};
  for (const license of licenses) {
    licenseMap[license.country_id] = license.user;
  }

  return countries.map((country) => ({
    ...country,
    features: {
      munchies: featureMap[country.country_id]?.munchies ?? true,
      herbs: featureMap[country.country_id]?.herbs ?? true,
      payments: featureMap[country.country_id]?.payments ?? true,
    },
    herbs_licensee: licenseMap[country.country_id] || null,
  }));
};

const admin_updateCountryFeature = async function (data) {
  const { country_id, feature_key, is_enabled } = data;
  if (!FEATURE_KEYS.includes(feature_key)) {
    throw "Invalid feature key";
  }
  const country = await Country.findOne({
    where: { id: country_id, status: "active" },
  });
  if (!country) {
    throw "Country not found";
  }

  const [row, created] = await CountryFeature.findOrCreate({
    where: { country_id, feature_key },
    defaults: { country_id, feature_key, is_enabled, status: "active" },
  });
  if (!created) {
    await row.update({ is_enabled, status: "active" });
  }
  return row;
};

// Assign (or replace) the single licensed herbs provider of a country.
// The previous license row is soft-deleted to keep an audit trail.
const admin_assignHerbsLicensee = async function (data) {
  const User = require("../models/user/user.model");
  const { country_id, user_id } = data;

  const country = await Country.findOne({
    where: { id: country_id, status: "active" },
  });
  if (!country) {
    throw "Country not found";
  }
  const user = await User.findOne({
    where: { id: user_id, status: "active", is_account_deleted: false },
  });
  if (!user) {
    throw "User not found";
  }

  await CountryHerbsLicense.update(
    { status: "deleted" },
    { where: { country_id, status: "active" } }
  );
  return CountryHerbsLicense.create({
    country_id,
    user_id,
    status: "active",
  });
};

const admin_revokeHerbsLicensee = async function (data) {
  const { country_id } = data;
  const updated = await CountryHerbsLicense.update(
    { status: "deleted" },
    { where: { country_id, status: "active" } }
  );
  if (!updated[0]) {
    throw "No active herbs license found for this country";
  }
  return { revoked: true };
};

// Admin override of a store's vertical. Setting 'herbs' still requires the
// store owner to be the country's licensee, the exclusivity rule has no
// admin bypass.
const admin_updateStoreType = async function (data) {
  const Store = require("../models/store/store.model");
  const StoreUser = require("../models/store/store_users.model");
  const { store_id, store_type } = data;

  if (!["general", "munchies", "herbs"].includes(store_type)) {
    throw "Invalid store type";
  }
  const store = await Store.findOne({
    where: { id: store_id, status: "active" },
  });
  if (!store) {
    throw "Store not found";
  }

  if (store_type === "herbs") {
    const countryId = await getStoreCountryId(store_id);
    if (!countryId) {
      throw "Store country could not be determined";
    }
    const owner = await StoreUser.findOne({
      where: { store_id, is_store_owner: true, status: "active" },
    });
    if (!owner || !(await isHerbsLicensee(owner.user_id, countryId))) {
      throw "The store owner is not the licensed herbs provider for the store's country";
    }
  }

  await store.update({ store_type });
  return store;
};

module.exports = {
  FEATURE_KEYS,
  admin_listCountryFeatures,
  admin_updateCountryFeature,
  admin_assignHerbsLicensee,
  admin_revokeHerbsLicensee,
  admin_updateStoreType,
  resolveCallerCountry,
  getCountryFeatures,
  isFeatureEnabled,
  getHerbsLicensee,
  isHerbsLicensee,
  getStoreCountryId,
  featureGate,
};
