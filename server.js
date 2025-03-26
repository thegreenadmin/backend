const path = require('path');
const express = require("express");
const cors = require('cors');
var cron = require('node-cron');
// const logger = require('./logger/logger');
require('custom-env').env(true)
require('./database/db.connect').connect().then();
const CroneController = require('./controllers/crone.controller');
const moment = require('moment');

const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:3520', 'http://localhost:3519'],
  optionsSuccessStatus: 200 // For legacy browser support
}

let app = express();
console.log("check code updated")
app.use((req, res, next) => { 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  req.request_time = moment().utc().toDate();next(); 
});
app.use(cors(corsOptions));
app.use(express.static('views/dist/adminlte/'));
app.set('view engine', 'ejs');



require('./routes/_index')(app);




// crones
cron.schedule("*/1 * * * *", async function() {
  try{
    await CroneController.orderHistoryNotificationController();
  }catch(err) {
     logger.err(err);
  }
});
// Array of times in EST
//===========Star code to run cron every (4 AM, 8 AM, 12PM, 4 PM, 8 PM,12 AM EST)=======.
const timesInEST = [
  { hours: 4, minutes: 0 },
  { hours: 8, minutes: 0 },
  { hours: 12, minutes: 0 },
  { hours: 16, minutes: 0 },
  { hours: 20, minutes: 0 },
  { hours: 0, minutes: 0 }
];
// Function to create a cron schedule for a given time in EST
const scheduleCronInEST = ({ hours, minutes }) => {
  // Create a moment object in EST
  let estTime = moment.tz({ hour: hours, minute: minutes }, "America/New_York");

  // Convert to UTC for scheduling with cron
  let utcTime = estTime.utc();

  // Extract the hours and minutes in UTC
  let utcHours = utcTime.hours();
  let utcMinutes = utcTime.minutes();

  // Schedule the cron job in UTC time
  cron.schedule(`${utcMinutes} ${utcHours} * * *`, async () => {
    await CroneController.autoChargesCroneController();
    console.log(`Cron job running at ${hours}:${minutes} EST`);
  });
};

timesInEST.forEach(scheduleCronInEST);

//========End code to run cron every (4 AM, 8 AM, 12PM, 4 PM, 8 PM,12 AM EST)============.


cron.schedule("0 */2 * * *", async function() {
  try{
    // logger.log("CroneController.reversePayouts");
    await CroneController.payoutsManageController();
  }catch(err) {
    // logger.err(err);
  }
})



cron.schedule("0 */6 * * *", async function() {
  try{
    // logger.log("CroneController.deleteOldUserSessionsController");
    await CroneController.deleteOldUserSessionsController();
  }catch(err) {
    // logger.err(err);
  }
})





app.get('*', function(req,res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
  res.render(path.resolve(`views/dist/adminlte/`));
});





app.listen(process.env.ENV_PORT || 8080, () => {
  console.log("process.env.NODE_ENV: ",process.env.NODE_ENV)
  console.log("Server running on ", process.env.ENV_PORT || 8080);
});
