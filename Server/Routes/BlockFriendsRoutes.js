const ex = require('express');
const AuthMiddleware = require("../Middlewares/AuthMiddleware");
const BlockedFriendsController = require("../Controllers/BlockFriendsController");

const block = ex.Router();

///////////////// Middlewares /////////////////

block.use(AuthMiddleware.HaveTheAccess);



///////////////// APIs /////////////////

block.get("/blockFriend/:TargetId", BlockedFriendsController.BlockFriend);
block.delete("/cancelBlockFriend/:TargetId", BlockedFriendsController.CancelBlockFriends);

module.exports = { block };