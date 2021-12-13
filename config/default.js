let Interruptores = {

    "sqlserver": {
        "host": 'localhost',
        "user": 'xxx',
        "password": 'xxx',
        "database": 'ssos'
    },
    "mqttserver": {
        "clientId": "ariel",
        "username": "xxx",
        "password": "xxx",
        "serverurl": "mqtt://192.168.1.229"
    },
    "webserver": "192.168.1.229",
    "webserverpuerto": "3002",
    "ambiente": "produccion",
    "titulo": "Interruptores"
};
let demo = {

    "sqlserver": {
        "host": 'localhost',
        "user": 'xxx',
        "password": 'xxx',
        "database": 'ssos'
    },
    "mqttserver": {
        "clientId": "ariel",
        "username": "xxx",
        "password": "xxx",
        "serverurl": "mqtt://192.168.1.51"
    },
    "webserver": "192.168.1.51",
    "webserverpuerto": "3002",
    "ambiente": "produccion",
    "titulo": "Interruptores"
};
let demo2 = {


    "mqttserver": {
        "clientId": "ariel",
        "username": "xxx",
        "password": "xxx",
        "serverurl": "mqtt://192.168.1.51"
    },
    "webserver": "192.168.1.51",
    "webserverpuerto": "3002",
    "ambiente": "produccion",
    "titulo": "Interruptores"
};
module.exports = Interruptores;