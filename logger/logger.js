require('custom-env').env(true)
const logger = require('logger').createLogger(`${__dirname}/${process.env.NODE_ENV}.log`);

module.exports = {
    log: function(data) {logger.log(data)},
    info: function(stringArr = ['']) {logger.info(stringArr)},
    err: function(stringArr = ['']) { console.log(stringArr); logger.error(stringArr)},
    loggerApi: function(req, res, next) {
        logger.log({
            path: req.path,
            body: req?.body,
            params: req?.params,
            query: req?.query
        })
        next()
    }
}