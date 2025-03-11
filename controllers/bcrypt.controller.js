require("custom-env").env(true);
const logger = require("./../logger/logger");

const bcrypt = require("bcrypt");
const MESSAGES = require("../utils/messages.util");
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS);

const createHashPassword = async function (password) {
  try {
    return await new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, function (saltErr, salt) {
        if (saltErr) {
          reject(saltErr);
          return;
        }
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) {
            // logger.err(MESSAGES.PASSWORD_HASH_NOT_GENERATED);
            reject(MESSAGES.PASSWORD_HASH_NOT_GENERATED);
          } else {
            resolve(hash);
          }
        });
      });
    });
  } catch (err) {
    throw err;
  }
};

const compareHash = async function (password, hashPassword) {
  try {
    return await new Promise((resolve, reject) => {
      bcrypt.compare(password, hashPassword, function (err, result) {
        if (err) {
          reject("Password not matched");
        } else {
          resolve(result);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { 
    createHashPassword, compareHash 
};
