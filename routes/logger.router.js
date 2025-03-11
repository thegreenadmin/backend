require("custom-env").env(true);
const express = require("express");
const LoggerRouter = express.Router();
const fs = require("fs");
const path = require("path");
const { adminAuth } = require("../controllers/auth.controller");

LoggerRouter.get('/logs', function(req, res) { 
    // fs.readFile(path.join(__dirname, `../logger/${process.env.NODE_ENV}.log`), "utf8", (err, data) => { 
    //     res.status(200).send(data.replace(/\n/g, '<br>').replace(/ /g, '<span>&nbsp;</span><span>&nbsp;</span>')) 
    // }) 
    // const readStream = fs.createReadStream(path.join(__dirname, `../logger/${process.env.NODE_ENV}.log`), {highWaterMark: 1024})
    // readStream.on('data', chunk => {
    //     const data = chunk.toString('utf-8');
    //     res.write(data)
    // })
    // readStream.on('end', chunk => {
    //     res.end();   
    // })
})
LoggerRouter.get('/logs/delete', function(req, res) { 
    // fs.writeFile(path.join(__dirname, `../logger/${process.env.NODE_ENV}.log`), '', (err) => {res.status(200).send("Logs cleared")})
})

module.exports = LoggerRouter;