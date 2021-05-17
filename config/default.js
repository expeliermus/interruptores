let demo = {
    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'demo'
    },
    "mqttserver" : {
        "clientId": "SmartSOS.net:demo",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl" : "mqtt://localhost"
    },
    "webserver":"icuadrado.net",
    "webserverpuerto":"8080",
    "ambiente":"demo",
    "titulo":"Demo Smart S.O.S."
}

module.exports = {
    "sqlserver": {
        "host": 'localhost',
        "user": 'frombakend',
        "password": 'backendpass',
        "database": 'desarrollo'
    },
    "mqttserver" : {
        "clientId": "ariel",
        "username": "UsuarioSOS",
        "password": "SOS2020",
        "serverurl" : "mqtt://localhost"
    },
    "webserver":"172.22.112.120",
    "webserverpuerto":"80",
    "ambiente":"produccion",
    "titulo":"Hospital Universitario"
}

