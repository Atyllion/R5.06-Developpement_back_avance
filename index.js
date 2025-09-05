var express = require('express');
var http = require('http');
const { Server } = require("socket.io");
var path = require('path');

var app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Variables
let users = new Map();

// Routes
app.get('/', function (req, res) {
    if (!req.query.username) {
        return res.redirect('/join');
    }
    res.render('index', { username: req.query.username });
});

app.get('/join', function (req, res) {
    res.render('join');
});

// Socket.IO
io.on('connection', (socket) => {
    socket.on('user join', (username) => {
        users.set(socket.id, username);
        socket.broadcast.emit('user connected', { username });
        io.emit('user count', users.size);
    });
    
    socket.on('chat message', (data) => {
        const username = users.get(socket.id);
        if (username) {
            io.emit('chat message', {
                username: username,
                message: data.message
            });
        }
    });
    
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            socket.broadcast.emit('user disconnected', { username });
            io.emit('user count', users.size);
        }
    });
});

server.listen(3000, function () {
   console.log("Chat en ligne: http://127.0.0.1:3000/join");
})