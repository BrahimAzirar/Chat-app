const ex = require("express");
const FriendsRequestsController = require("../Controllers/FriendsRequestsController");
const AuthMiddlewares = require("../Middlewares/AuthMiddleware");
const FriendRequestsMiddleware = require("../Middlewares/FriendRequestsMiddleware");

const FriendsRequests = ex.Router();

///////////////// Middlewares /////////////////

FriendsRequests.use(AuthMiddlewares.HaveTheAccess);
FriendsRequests.use("/sendFriendRequest/:TargetMember", FriendRequestsMiddleware.FriendRequestIsExist);

///////////////// APIs /////////////////

FriendsRequests.get("/sendFriendRequest/:TargetMember", FriendsRequestsController.SendFriendRequest);
FriendsRequests.get("/seeFriendsRequests", FriendsRequestsController.SeeFriendsRequests);
FriendsRequests.get("/acceptFriendRequest/:TargetMember", FriendsRequestsController.AcceptFriendRequest);
FriendsRequests.get("/cancelFriendRequest/:TargetMember", FriendsRequestsController.CancelFriendRequest);

module.exports = { FriendsRequests };