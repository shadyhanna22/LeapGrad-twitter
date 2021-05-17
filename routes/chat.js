const express = require("express");
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const ChatController = require('../controllers/chat');


// Start new chat between user and receiver
// Creates a new chat between 2 users using the Chat model
router.post('/new/:receiverId', checkAuth, ChatController.newChat);

// Get a Chat
router.get('/:chatId', checkAuth, ChatController.getChatMessages);

// send a message to chat
// message text will be in the body as {"text": ""}
router.post('/send/:receiverId', checkAuth, ChatController.sendMessage);

module.exports = router;