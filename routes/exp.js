var express = require('express');
var router = express.Router();
const config = require("config");
const fs = require('fs');
//const conn= require('../sql.js');
const client = require('../mqttconf');

const webserver = config.get("webserver");
const webport = config.get("webserverpuerto");
const ambiente = config.get("ambiente");
const titulo = config.get("titulo");


router.get('/', function (req, res) {
    fs.readFile("habitaciones.html", function (err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        html_string = html_string.replace(/xyzopqwebserver/g, webserver);
        html_string = html_string.replace(/xyzopqwebport/g, webport);
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});


module.exports = router;