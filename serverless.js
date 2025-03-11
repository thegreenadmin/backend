const serverless = require('serverless-http');
const app = require('./server'); // Import the main Express app

module.exports.handler = serverless(app);
