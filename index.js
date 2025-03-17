const serverless = require('serverless-http');
const app = require('./routes/_index'); // Import the main Express app

module.exports.handler = serverless(app);
