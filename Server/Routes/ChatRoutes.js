const ex = require('express');
const ChatController = require('../Controllers/ChatController');
const AuthMiddleware = require("../Middlewares/AuthMiddleware");

const chat = ex.Router();

///////////////// Middlewares /////////////////

chat.use(AuthMiddleware.HaveTheAccess);

///////////////// APIs /////////////////

chat.get('/getFriends', ChatController.GetFriends);
chat.get('/getMessages/:TargetMember', ChatController.GetMessages);
chat.post('/addMessage', ChatController.AddMessage);
chat.delete('/deleteMessage/:messageId', ChatController.DeleteMessage);

module.exports = { chat };