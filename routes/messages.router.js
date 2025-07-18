const express = require("express");
const { userAuth } = require("../controllers/auth.controller");
const {
  fetchUserMessageHeads,
  fetchUserMessages,
  userSendMessage,
  deleteUserMessageHead,
  contactStoreMessages,
} = require("../controllers/message.controller");
const {
  sendConflictResponse,
  sendOkResponse,
  sendCreatedResponse,
} = require("../utils/response.util");
const router = express.Router();

router.get("/inbox", userAuth, async function (req, res) {
  try {
    const messageHeads = await fetchUserMessageHeads(
      req.query,
      req.payload.user.id
    );
    sendOkResponse(res, messageHeads, "Message heads successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/list", userAuth, async function (req, res) {
  try {
    const messages = await fetchUserMessages(req.query);
    sendOkResponse(res, messages, "Messages successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.post("/send", userAuth, async function (req, res) {
  try {
    const message = await userSendMessage(req.body, req.payload.user.id);
    sendCreatedResponse(res, message, "Message successfully sent");
  } catch (err) {
    console.log(err);
    sendConflictResponse(res, {}, err);
  }
});

router.delete("/delete", userAuth, async function (req, res) {
  try {
    const deleteMessage = await deleteUserMessageHead(
      req.body,
      req.payload.user.id
    );
    sendOkResponse(res, deleteMessage, "Store messages successfully deleted");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

router.get("/store", userAuth, async function (req, res) {
  try {
    const messages = await contactStoreMessages(req.query, req.payload.user.id);
    sendOkResponse(res, messages, "Messages successfully fetched");
  } catch (err) {
    sendConflictResponse(res, {}, err);
  }
});

module.exports = {
  messageRouter: router,
};
