const logger = require("../logger/logger");
const moment = require('moment')

function getSimplifiedErrors(data, err) {
    try{
        // logger.err(err);
        let message = err;
        if(err.errors) {
            if(err.name == 'SequelizeUniqueConstraintError') {
                err = err.errors.map(e => e.message)
                message = err[0];
            }else{
                err = err.errors.map(e => e.message)
                message = err[0];
            }
        }
        else if(err.message) {
            err = [err.message];
            message = err[0];
        }
        else if(typeof(err) == "string") {
            // return {message}
            err = [err];
            message = err[0];
        }
        return {message: message, errors: err}
    }catch(err) {
        return {message: "Something went wrong", errors: ["Something went wrong"]}
    }
}

function getPrefilledRequestJson(req) {
    return {method: req?.method, path: req?.baseUrl+req?.path, headers: req.headers, ip: req?.ip, request_time: req?.request_time, response_time: moment().utc().toDate(), body: req?.body, params: req?.params, query: req?.query, payload: req?.payload?.admin?.toJSON() || req?.payload?.user || {}}
}


const sendOkResponse = function(res, data, message) {
    const req = res.req;
    //logger.log("--------------------------API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req), message,  })
    //logger.log("========================API END=============================")
    res.status(200).send({status: 200, message, data})
}

const sendCreatedResponse = function(res, data, message) {
    const req = res.req;
    //logger.log("--------------------------API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req), message,  })
    //logger.log("========================API END=============================")
    res.status(201).send({status: 201, message, data});
}

const sendNoContentResponse = function(res, data, message) {
    const req = res.req;
    //logger.log("--------------------------API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req), message,  })
    //logger.log("========================API END=============================")
    res.status(204).send({status: 204, message, data});
}

const sendConflictResponse = function(res, data, err) {
    const req = res.req;
    //logger.log("--------------------------API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req)})
    //logger.log("========================API END=============================")
    res.status(409).send({status: 409, ...getSimplifiedErrors(data, err)});
}

const sendUnauthorizedResponse = function(res, data, err) {
    const req = res.req;
    //logger.log("--------------------------UNAUTHORIZED API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req)})
    //logger.log("========================API END=============================")
    res.status(401).send({status: 401, ...getSimplifiedErrors(data, err)});
}

const sendForbiddenResponse = function(res, data, err) {
    const req = res.req;
    res.status(403).send({status: 403, ...getSimplifiedErrors(data, err)});
}

const sendBadRequestResponse = function(res, data, err) {
    const req = res.req;
    //logger.log("--------------------------API-------------------------------")
    //logger.log({ ...getPrefilledRequestJson(req)})
    //logger.log("========================API END=============================")
    res.status(400).send({status: 400, ...getSimplifiedErrors(data, err)});
}





module.exports = {
    sendOkResponse, sendCreatedResponse, sendConflictResponse,
    sendUnauthorizedResponse, sendBadRequestResponse, sendNoContentResponse,
    sendForbiddenResponse,

}
