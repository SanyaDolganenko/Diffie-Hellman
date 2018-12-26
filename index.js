const http = require('http');
const express = require('express');
var app = express();
const bodyParser = require("body-parser");
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server
});
const port = 3000;
var singleuseNotebook = require('./utils/SingleuseNotebook.js');


var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
        purpose: 'diffiePublic',
        body: singleuseNotebook.initialKeySend()

    }));
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            console.log(message);
            var messageJson = JSON.parse(message);
            console.log('received: %s', message);
            if (messageJson.purpose === 'message') {

                var messageText = messageJson.body;
                console.log("Received encrypted message: " + messageText);
                var decrypted = singleuseNotebook.decrypt(messageText);
                console.log("Decrypting encrypted message: " + decrypted);

                var newEncryptedMessage = singleuseNotebook.encrypt(decrypted + " " + decrypted);
                ws.send(JSON.stringify({
                    body: newEncryptedMessage,
                    purpose: "message"
                }));

            } else if (messageJson.purpose === 'diffieKey') {
                var B = parseInt(messageJson.body);
                singleuseNotebook.calculateKey(B);
            }
        } catch (e) {
            ws.send(JSON.stringify({body: "Invalid JSON", purpose: "error"}));
            console.log(e);
        }
    });
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(allowCrossDomain);

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send("GET request to sender page.");
    console.log("Received get request");
});

server.listen(process.env.PORT || port, (err) => {
    if (err) {
        console.log('An error occured', err);
        return
    }
    console.log(`Server started on port ${server.address().port}`);
});
