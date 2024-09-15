const ex = require("express");
const MembersController = require("../Controllers/MembersController");
const AuthMiddlewares = require("../Middlewares/AuthMiddleware");

const members = ex.Router();

////////////////// Middlewares //////////////////

members.use(AuthMiddlewares.HaveTheAccess);

////////////////// APIs //////////////////

members.get('/getMembers', MembersController.getMembers);
members.get('/SearchMembers', MembersController.SearchMembers);
// members.get('/addMembers', MembersController.addMembers);

module.exports = { members };