require('custom-env').env(true)
const tzlookup = require("tz-lookup");
const moment = require('moment');


const generateRandomNumber = function () {
    return String(Math.floor(Math.random() * 8999) + 100);
}


const getSecondsFromDaysCount = function (days) {
    return Math.floor(Date.now() / 1000) + (60 * 60) * 24 * parseInt(days);
}


const foreignRelationCreateTableTimeout = function (foreignKeysCount) {
    return parseInt(foreignKeysCount) * 1999;
}


const getRandomVerificationCode = function() {
    return String(Math.floor(Math.random() * 10000000000000));
}


const getRoundFigure = function(value = 0) {
    return value.toFixed(2);
}

const timeout = async function(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, timeout)
    })
}

// Function to get the local time based on coordinates
const getLocalTimeFromCoordinates = (latitude, longitude) => {
  const timeZone = tzlookup(latitude, longitude);
  const currentTime = moment().tz(timeZone).format("HH:mm:ss"); // Ensure it matches DB format
  return currentTime;
};

const getLocalDayFromCoordinates = (latitude, longitude) => {
  // Get the timezone from the latitude and longitude
  const timeZone = tzlookup(latitude, longitude);
  // Get the current day in that timezone (0 = Sunday, 6 = Saturday)
  const currentDay = moment().tz(timeZone).day();
  // Convert Sunday (0) to 7 to match your DB format
  return currentDay === 0 ? 7 : currentDay;
};


module.exports = { 
    generateRandomNumber, getSecondsFromDaysCount, foreignRelationCreateTableTimeout ,
    getRandomVerificationCode, getRoundFigure, timeout, getLocalTimeFromCoordinates, getLocalDayFromCoordinates
}