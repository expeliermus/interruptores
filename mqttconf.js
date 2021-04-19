var mqtt = require('mqtt');
const config = require("config");


///////////////////// conexion por MQTT
const mqttclientId = config.get("mqttserver.clientId");
const mqttusername = config.get("mqttserver.username");
const mqttpassword = config.get("mqttserver.password");
const mqttserver = config.get("mqttserver.serverurl");
options = {
    clientId: mqttclientId,
    username: mqttusername,
    password: mqttpassword,
    keepalive: 0,
    qos: 2,
    clean: false
};
var client = mqtt.connect(mqttserver, options);


module.exports = client;