const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')

require('./routes/mqttapp');
var ruteaRaiz = require('./routes/raiz');


var app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/assets/', express.static('assets/')) ///// borrarlo es solo por la compatibilidad entre mi pc y el server
app.use('/download/', express.static('download/'))


app.use('/', ruteaRaiz);


module.exports = app;
