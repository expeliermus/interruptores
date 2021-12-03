let botonera = {

    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'desarrollo'
    },
    "mqttserver": {
        "clientId": "ariel",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl": "mqtt://localhost"
    },
    "webserver": "localhost",
    "webserverpuerto": "3000",
    "ambiente": "produccion",
    "titulo": "test"
};

let test = {
    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'desarrollo'
    },
    "mqttserver": {
        "clientId": "SmartSOS.net:test",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl": "mqtt://localhost"
    },
    "webserver": "icuadrado.net",
    "webserverpuerto": "3001",
    "ambiente": "produccion",
    "titulo": "test Smart S.O.S."
};

let demo = {
    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'demo'
    },
    "mqttserver": {
        "clientId": "SmartSOS.net:demo",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl": "mqtt://localhost"
    },
    "webserver": "icuadrado.net",
    "webserverpuerto": "8080",
    "ambiente": "demo",
    "titulo": "Demo Smart S.O.S."
};

let HU = {
    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'desarrollo'
    },
    "mqttserver": {
        "clientId": "ariel",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl": "mqtt://localhost"
    },
    "webserver": "172.22.112.120",
    "webserverpuerto": "80",
    "ambiente": "produccion",
    "titulo": "Hospital Universitario"
};

module.exports = botonera;