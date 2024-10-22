const ex = require('express');
const { MongoClient } = require('mongodb');
const { auth } = require('./Routes/AuthRoutes');
const { members } = require("./Routes/MembersRoutes");
const { FriendsRequests } = require("./Routes/FriendsRequestsRoutes");
const { chat } = require("./Routes/ChatRoutes");
const { block } = require("./Routes/BlockFriendsRoutes");
const { settings } = require("./Routes/SettingsRoutes");
const cookieParser = require('cookie-parser');
const cors = require("cors");
require('dotenv').config();

const app = ex();
let db;

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.CLIENT_URL, // Frontend URL
        credentials: true                // Allow cookies and authentication headers
    }
});

app.use(ex.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use('/authMember', auth);
app.use('/members', members);
app.use('/friendsRequests', FriendsRequests);
app.use('/chat', chat);
app.use('/block', block);
app.use('/settings', settings);

io.on('connection', socket => {
    try {
        console.log("WebSocket Connection Is Open :)");

        // Listen for disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    } catch (error) {
        console.log("WebSocket error: ", error.message);
    }
});

MongoClient.connect(process.env.MONGO_URL)
    .then(client => {
        db = client.db('ChatDB');
        app.locals.client = client;
        app.locals.db = db;
        app.locals.io = io;

        app.get('/', (req, res) => {
            return res.status(200).json({ response: "I'm Brahim Azirar" });
        });

        console.log("Connected with mongodb :)");
        server.listen(3500, console.log("Starting the server (http://localhost:3500)"));
    })
    .catch(err => console.log(`the error from server.js: ${err.message}`));
