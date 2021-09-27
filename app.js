// package imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const socketio = require("socket.io");
const http = require("http");
const expressLayouts = require('express-ejs-layouts');

//
require('dotenv').config();

// local imports
const parameters = require("./config/params");
const webParameters = require("./config/web_params.json");
const socketUtils = require("./utils/socket_utils");

// routes includes
const apiRoute = require("./routes/api");
const webRoute = require("./routes/web");
const adminRoute = require('./routes/admin');
const tenantRoute = require('./routes/tenant');
const renterRoute = require('./routes/renter');
const landlordRoute = require('./routes/landlord');


// imports initailizations
const app = express();
const server = http.createServer(app);
const io = socketio(server);
let users = [];

app.locals = webParameters;

// Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// set up public folder
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", webRoute);
app.use("/api", apiRoute);
app.use('/admin', adminRoute);
app.use('/tenant', tenantRoute);
app.use('/renter', renterRoute);
app.use('/landlord', landlordRoute);

// 404 not found
app.use(function (req, res) {
    res.status(404).render('base/404');
});

// socket code for chat systems
io.on("connection", socket => {


    // socket.emit() for only the connected user
    // socket.broadcast.emit() for every other user except the connected user
    // io.emit(broadcasts to every body);
    console.log(`A user is connected to the socket with socket id of ${socket.id}`);
    
    //socket.emit("message", socketHelpers.formatMessage("admin", "Welcome to Cryptedge"));

    // once a user is connected, save their id,
    socket.on("joined", (id) => {
        console.log(`the user id is ${id}`);
        users[id] = socket.id;
        console.log(users);
    });
    
    socket.on("chatMessage", (content) => {
        console.log(content);
        socketUtils.addChatAndFormatMessage(content.senderId, content.receiverId, content.propertyId, content.msg).then(data => {
            //console.log(`the return value is ${data}`);
            let senderSocketId = users[content.senderId];
            let receiverSocketId = users[content.receiverId];

            // send back the messages to myself
            io.to(senderSocketId).emit("my_message", data);

            // send the message to the receiver
            console.log(`i am sending from ${senderSocketId} to ${receiverSocketId}`);
            io.to(receiverSocketId).emit("incoming_message", data);
        });
    });
    
    // runs when users disconnects from socket
    socket.on('disconnect', () => {
        console.log(`A user has disconnected from the socket with id of ${socket.id}`);
        //io.emit("message", socketHelpers.formatMessage("admin", "User has left the site"));
    });    
});



let PORT = process.env.PORT || parameters.LOCAL_PORT;
server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});