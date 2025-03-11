const express = require("express");
const { userAuth, adminAuth } = require("../controllers/auth.controller");
const { uploadFile, multipleFileUpload, uploadPublicImageFile } = require("../controllers/s3.controller");
const { FILE_SUCCESSFULLY_UPLOADED } = require("../utils/messages.util");
const { sendCreatedResponse, sendConflictResponse } = require("../utils/response.util");
const router = express.Router();




const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload/single', userAuth, upload.single('file'), async function(req, res) {
    try{
        const fileLink = await uploadFile(req.file);
        sendCreatedResponse(res, {urls: fileLink}, FILE_SUCCESSFULLY_UPLOADED)
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
});



router.post('/upload/multiple', userAuth, upload.array('files', 10), async function(req, res) {
    try{
        if(!req.files) {
            throw "Invalid request parameters";
        }
        const files = await multipleFileUpload(req.files);
        sendCreatedResponse(res, {files}, FILE_SUCCESSFULLY_UPLOADED)
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
});




router.post('/admin/upload/single', adminAuth, upload.single('file'), async function(req, res) {
    try{
        const fileLink = await uploadFile(req.file);
        sendCreatedResponse(res, {urls: fileLink}, FILE_SUCCESSFULLY_UPLOADED)
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
});



router.post('/admin/upload/multiple', adminAuth, upload.array('files', 10), async function(req, res) {
    try{
        if(!req.files) {
            throw "Invalid request parameters";
        }
        const files = await multipleFileUpload(req.files);
        sendCreatedResponse(res, {files}, FILE_SUCCESSFULLY_UPLOADED)
    }
    catch(err) {
        sendConflictResponse(res, {}, err);
    }
});





router.post('/upload/image/public', upload.single('file'), async function(req, res) {
    try{
        const fileLink = await uploadPublicImageFile(req.file);
        res.status(201).json(fileLink);
    }catch(err) {
        sendConflictResponse(res, {}, err);
    }
})





module.exports = {fileRouter: router}