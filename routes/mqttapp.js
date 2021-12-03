module.exports = function (options) {

    //nadador('viaje');



    //  const io = options;

    const client = require('../mqttconf');

    //console.log("está conectado a mosquito?  " + client.connected);
    client.on("connect", function (b) {
        console.log("está conectado a mosquito? " + client.connected);
        grabaEvento("connect", b.cmd);
    });
    client.on("error", function (error) {
        console.log("no pudo conectarse al servidor mqtt " + error);
        grabaEvento("error", error);
        process.exit(1);
    });
    client.on("reconnect", function () {
        console.log("ocurrio un reconect MQTT");
        grabaEvento("reconnect", "");
    });
    client.on("close", function () {
        console.log("ocurrio un close MQTT");
        grabaEvento("close", "");
    });
    client.on("disconnect", function (b) {
        console.log("ocurrio un disconnect MQTT");
        grabaEvento("disconnect", b);
    });
    client.on("offline", function () {
        console.log("ocurrio un offline MQTT");
        grabaEvento("offline", "");
    });
    client.on("end", function () {
        console.log("ocurrio un end MQTT");
        grabaEvento("end", "");
    });
    client.on("packetsend", function (b) {
        //console.log("ocurrio un packetsend");
        //grabaEvento("packetsend", b.topic);
    });
    client.on("packetreceive", function (b) {
        //console.log("ocurrio un packetreceive");
        // grabaEvento("packetreceive", b.topic);
    });
    client.on('message', function (topic, message, packet) {
        console.log("MSG " + topic + " " + message);
        /* 
        var q = JSON.parse(JSON.stringify(packet.payload));
        w = String.fromCharCode.apply(String, q.data);
        let laquery = "INSERT INTO `desarrollo`.`todo`(`topic`,`msg`,`qos`,`msgtype`,`msgdata`,`cant_items`,`messageId`,`cmd`,`retain`,`dup`,`length`)VALUES (?,?,?,?,?,?,?,?,?,?,?);"
        let todo = [packet.topic, message, packet.qos, q.type, w, Object.keys(packet).length, packet.messageId, packet.cmd, packet.retain, packet.dup, packet.length];
        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {
                console.log('no se conecto a la base de datos desarrollo');
                console.log('error en la consulta: ' + laquery + ' ' + todo);
            }
        });
        */



    });

    function grabaEvento(a, b) {
        let laquery = "INSERT INTO eventos (`evento`,`info`) VALUES (?,?);";
        let todo = [a, JSON.stringify(b)];
        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {

                console.log('error en la consulta: ' + laquery + ' ' + todo);
            }
        });
    }

    function altamac(mac) {
        // es diferente a cuando se llama a la pagina /macalta
        // harle el alta en 3 topics + alta en web
        var habitacion = 'desconocida';


        var laquery = "select mac from mac where mac='" + mac + "';";
        conn.query(laquery, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                //length==0 significa no hubo resultados, no hay link o paso el tiempo. En este caso es que no se duplicará
                if (rows.length == 0) {
                    var laquery = "insert into mac (mac,habitacion,ultrespuesta) values ('" + mac + "' , '" + habitacion + "',CURRENT_TIMESTAMP)"; //chequear porque agregué ultrespuesta , CURRENT_TIMESTAMP
                    conn.query(laquery, function (err, rows) {
                        if (err) {
                            console.log('No se dió de alta el dispositovo, el formato de los datos no es aceptado, tal vez sea la longitud de ellos');
                        } else {
                            client.subscribe(mac + '/alerta', { qos: 2 }, function (err, granted) {
                                if (err) {
                                    console.log("--> no pudo subscribirse a " + mac);
                                } else {
                                    //console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
                                    client.subscribe(mac + '/rfid', { qos: 2 }, function (err, granted) { });
                                    client.subscribe(mac + '/estado', { qos: 2 }, function (err, granted) { });
                                    client.subscribe(mac + '/vivo', { qos: 0 }, function (err, granted) { });
                                    client.subscribe(mac + '/vivoconf', { qos: 0 }, function (err, granted) { });
                                }
                            });
                        }
                    });
                } else {

                    /// resulta que cuando un aplaca se conecta enesguida manda el alta/
                    // entonces me cuelgo de esto para apagar la habitacion negra y pasarla al color que corresponda.  Inmediatamente.  sin espetart al chequeastatus()
                    laquery = "update mac set ultrespuesta = CURRENT_TIMESTAMP where mac=?;";
                    todo = [mac];
                    conn.query(laquery, todo);

                    laquery = "select mac,colordisp from mac m join dashboard d on m.habitacion=d.habitacion join color c on c.estado=d.estado where mac='" + mac + "';";
                    conn.query(laquery, function (err, rows) {
                        if (rows.length > 0) {
                            client.publish(rows[0]['mac'] + '/estado', rows[0]['colordisp'], { qos: 2 });
                        }
                    });

                    io.to('habitaciones').emit('habitacion', { 'habitacion': 'todas', 'color': 'todos', 'estado': 'alta' });

                }
            }
        });

    }
    /*
        ////////// SUBSCRIBIRSE
        laquery = "SELECT mac FROM mac where habitacion != 'h1' order by mac asc;";
        todo = [];
        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {
                console.log('no se obtuvo la lista de MACs de las tarjetas');
            } else {
                //var respuesta = JSON.parse(rows);   falla, no es el formato
                for (var caso of rows) {
                    client.subscribe(caso.mac + '/alerta', { qos: 2 }, function (err, granted) {
                        if (err) { console.log("--> no pudo subscribirse a " + caso.mac); } else {
                            //console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
                        }
                    });
                    client.subscribe(caso.mac + '/rfid', { qos: 2 }, function (err, granted) { });
                    client.subscribe(caso.mac + '/estado', { qos: 2 }, function (err, granted) { });
                    client.subscribe(caso.mac + '/vivo', { qos: 0 }, function (err, granted) { });
                    client.subscribe(caso.mac + '/vivoconf', { qos: 0 }, function (err, granted) { });
                }
            }
        });
        laquery = "SELECT mac FROM mac where habitacion = 'h1' order by mac asc;";
        todo = [];
        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {
                console.log('no se obtuvo la lista de MACs de las heladeras');
            } else {
                for (var caso of rows) {
                    client.subscribe(caso.mac + '/mide', { qos: 2 }, function (err, granted) {
                        if (err) { console.log("--> no pudo subscribirse a " + caso.mac); } else {
                        }
                    });
                    client.subscribe(caso.mac + '/puerta', { qos: 2 }, function (err, granted) {
                        if (err) { console.log("--> no pudo subscribirse a " + caso.mac); } else {
                        }
                    });
                }
            }
        });
    
    
    
    
        //subscribeBotonRemoto(); no, esto era para cuando habia un apk con mqtt
        client.subscribe('alta/', { qos: 2 }, function (err, granted) {
            //console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
        });
        //var topic_list=["prueba1","prueba2","prueba3","prueba4","A0:20:A6:0B:42:81/alerta","A0:20:A6:0B:42:81/rfid"];
        //client.subscribe(topic_list,{qos:2}); //topic list
    
        /// Repetir cada X minutos, llamar a las placas y grabar su respuesta
        function estanvivas() {
            let laquery = "SELECT mac FROM mac;";
            let todo = [];
            conn.query(laquery, todo, (err, rows, fields) => {
                for (var caso of rows) {
                    client.publish(caso.mac + '/vivo', 'estas?', { qos: 0 });
                }
            });
        }
        setInterval(estanvivas, 2 * 60000);
    
    
    
        //client.publish('DC:4F:22:5E:C7:AF/alerta', '4;2', { qos: 0 });
        //client.publish('DC:4F:22:5E:C7:AF/rfid', '3794322652', { qos: 0 });
        function subscribeBotonRemoto() {
            let laquery = "select distinct cod from botonremoto;";
            let todo = [];
            conn.query(laquery, todo, (err, rows, fields) => {
                if (err) {
                    console.log('no se obtuvo la lista de habitaciones de la tabla botonremoto');
                } else {
                    for (var caso of rows) {
    
                        client.subscribe(caso.cod + '/alta', { qos: 2 }, function (err, granted) {
                            //   console.log('Subscripto: ' + granted[0].topic + '     qos:' + granted[0].qos); 
                        });
                        client.subscribe(caso.cod + '/estado', { qos: 2 }, function (err, granted) {
                            //console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos); 
                        });
                        client.subscribe(caso.cod + '/alerta', { qos: 0 }, function (err, granted) {
                            //console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos); 
                        });
                    }
                }
            });
        }
        //////////  FIN SUBSCRIBIRSE
    */
};