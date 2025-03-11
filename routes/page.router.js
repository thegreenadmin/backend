const express = require("express");
const {  listPageTypes, getSystemPageByPageType } = require("../controllers/page.controller");
const { sendConflictResponse, sendOkResponse } = require("../utils/response.util");
const router = express.Router();






router.get('/:pageName', async function(req, res) {
    try{
        const page = await getSystemPageByPageType(req.params.pageName);
        res.send(page)
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})






router.get('/types/list', async function(req, res) {
    try{
        const pageTypes = await listPageTypes();
        sendOkResponse(res, pageTypes, "Page types list successfully fetched");
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})








module.exports = {
    pageRouter: router
}