const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')


var app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/assets/', express.static('assets/')) ///// borrarlo es solo por la compatibilidad entre mi pc y el server
app.use('/download/', express.static('download/'))





const http = require('http');
const config = require("config");
const port = config.get("webserverpuerto");
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

global.nadador=  (n) => {
  console.log('------------------------------------');
  console.log('---    ' + n);
  console.log('------------------------------------');
}


global.io = socketio(server);

require('./routes/mqttapp');
app.use('/', require('./routes/raiz'));
app.use('/exp', require('./routes/exp'));

io.on('connection', (socket) => {
  require('./routes/ioapp')(socket);
  
});

