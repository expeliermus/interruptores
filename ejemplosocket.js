const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');


var app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

const http = require('http');
const config = require("config");
const port = 3000; //config.get("webserverpuerto");

app.set('port', port);

const socketio = require('socket.io');
var server = http.createServer(app);





server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

global.nadador = (n) => {
    console.log('------------------------------------');
    console.log('---    ' + n);
    console.log('------------------------------------');
};




global.io = socketio(server);
app.use('/assets/', express.static('assets/'));
app.use('/demo', require('./routes/demo'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/demosocket.html');
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
    socket.on('habitacion', (msg) => {
        console.log('message: ' + JSON.stringify(msg));
        socket.broadcast.emit('message', msg);
    });


    socket.emit('welcome', { message: 'Conectado con el servidor SmartSOS', id: socket.id });

    socket.on('i am client', function (data) {
        console.log(data);
        if (data.app == 'habitaciones') {
            socket.join('habitaciones');
        }
    });



    socket.on('disconnect', () => {
        console.log("IO desconectado");
        socket.leave('habitaciones');
    });
    socket.on("meDesconecto", () => {
        console.log("IO se Desconecta");
        socket.leave('habitaciones');
    });


});

