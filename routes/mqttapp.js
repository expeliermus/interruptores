const conn= require('../sql.js');
const client= require('../mqttconf');
let laquery = "CALL mantenimiento();";
let todo = [];
conn.query(laquery, todo, (err, rows, fields) => {
    if (err) {
        console.log('atención que al arrancar hubo error con SQL');
    }
});
console.log("está conectado a mosquito?  " + client.connected);

client.on("connect", function(b) {
    console.log("está conectado a mosquito? " + client.connected);
    grabaEvento("connect", b.cmd);
})
client.on("error", function(error) {
    console.log("no pudo conectarse al servidor mqtt " + error);
    grabaEvento("error", error);
    process.exit(1)
});
client.on("reconnect", function() {
    console.log("ocurrio un reconect");
    grabaEvento("reconnect", "");
})
client.on("close", function() {
    console.log("ocurrio un close");
    grabaEvento("close", "");
})
client.on("disconnect", function(b) {
    console.log("ocurrio un disconnect");
    grabaEvento("disconnect", b);
})
client.on("offline", function() {
    console.log("ocurrio un offline");
    grabaEvento("offline", "");
})
client.on("end", function() {
    console.log("ocurrio un end");
    grabaEvento("end", "");
})
client.on("packetsend", function(b) {
    //console.log("ocurrio un packetsend");
    //grabaEvento("packetsend", b.topic);
})
client.on("packetreceive", function(b) {
    //console.log("ocurrio un packetreceive");
    // grabaEvento("packetreceive", b.topic);
})
client.on('message', function(topic, message, packet) {
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
    var parte = topic.split("/");
    var accion = message.toString().split(";");
    if (accion[1] === undefined) { accion[1] = 0 };
    if (parte[1] != 'vivo' && parte[1] != 'controles' && parte[1] != 'estado') {
        if (parte[0].substring(0, 1) == 'P') {
            // no hay mac que comience con P  entonces se trata de un boton remoto OJO si aumenta el tamaño del TOKEN
            if (parte[0].length <= 17 && parte[1].length <= 10 && accion[0].length <= 12 && parseInt(accion[1]) <= 999999) {
                laquery = "call RecibeBotonRemoto(?,?,?,?,@resultado,@lamac,@resultadodisp);";
                todo = [parte[0], parte[1], accion[0], accion[1]];
                //console.log(laquery+ ' ' + todo)
                conn.query(laquery, todo, (err, rows, fields) => {
                    if (err) {
                        console.log('error en la consulta: ' + laquery + ' ' + todo);
                    } else {
                        //console.log(rows[0][0].resultado);
                        if (rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
                            client.publish(parte[0] + '/estado', rows[0][0].resultadodisp.toString(), { qos: 2 });
                        }
                        if (rows[0][0].resultadodisp != '0' && rows[0][0].resultadodisp != undefined) {
                            client.publish(rows[0][0].lamac + '/estado', rows[0][0].resultadodisp.toString(), { qos: 2 });
                        }


                    }

                });
            }
        } else {
            if (parte[0] == 'alta') {
                // esta parte registra en la tabla TODO unicamente cuando recibe un alta, sirve para saber si una placa está dando problemas
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
                // fin
                altamac(accion[0]);
            } else {
                //aqui va el grueso, SQL define que hacer
                if (parte[0].length <= 17 && parte[1].length <= 10 && accion[0].length <= 12 && parseInt(accion[1]) < 999) {
                    laquery = "call RecibeMSG(?,?,?,?, @resultado,@lamac);";
                    todo = [parte[0], parte[1], accion[0], parseInt(accion[1])];
                    conn.query(laquery, todo, (err, rows, fields) => {
                        if (err) {
                            console.log('error en la consulta: ' + laquery + ' ' + todo);
                        } else {
                            if (rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
                                client.publish(rows[0][0].lamac + '/estado', rows[0][0].resultado.toString(), { qos: 2 });
                            }
                        }

                    });
                }
            }
        }
    }
});

function grabaEvento(a, b) {
    let laquery = "INSERT INTO `desarrollo`.`eventos` (`evento`,`info`) VALUES (?,?);";
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
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            //length==0 significa no hubo resultados, no hay link o paso el tiempo. En este caso es que no se duplicará
            if (rows.length == 0) {
                var laquery = "insert into mac (mac,habitacion) values ('" + mac + "' , '" + habitacion + "')";
                conn.query(laquery, function(err, rows) {
                    if (err) {
                        console.log('No se dió de alta el dispositovo, el formato de los datos no es aceptado, tal vez sea la longitud de ellos');
                    } else {
                        client.subscribe(mac + '/alerta', { qos: 2 }, function(err, granted) {
                            if (err) {
                                console.log("--> no pudo subscribirse a " + mac);
                            } else {
                                console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
                                client.subscribe(mac + '/rfid', { qos: 2 }, function(err, granted) {});
                                client.subscribe(mac + '/estado', { qos: 2 }, function(err, granted) {});
                                client.subscribe(mac + '/vivo', { qos: 0 }, function(err, granted) {});
                                client.subscribe(mac + '/vivoconf', { qos: 0 }, function(err, granted) {});
                            }
                        });
                    }
                });
            } else {
                laquery = "select mac,colordisp from mac m join dashboard d on m.habitacion=d.habitacion join color c on c.estado=d.estado where mac='" + mac + "';";
                conn.query(laquery, function(err, rows) {
                    if (rows.length > 0) {
                        client.publish(rows[0]['mac'] + '/estado', rows[0]['colordisp'], { qos: 2 });
                    }
                });
            }
        }
    });

}

////////// SUBSCRIBIRSE
laquery = "SELECT mac FROM mac order by mac asc;";
todo = [];
conn.query(laquery, todo, (err, rows, fields) => {
    if (err) {
        console.log('no se obtuvo la lista de MACs de las tarjetas');
    } else {
        //var respuesta = JSON.parse(rows);   falla, no es el formato
        for (var caso of rows) {
            client.subscribe(caso.mac + '/alerta', { qos: 2 }, function(err, granted) {
                if (err) { console.log("--> no pudo subscribirse a " + caso.mac); } else {
                    console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
                }
            });
            client.subscribe(caso.mac + '/rfid', { qos: 2 }, function(err, granted) {});
            client.subscribe(caso.mac + '/estado', { qos: 2 }, function(err, granted) {});
            client.subscribe(caso.mac + '/vivo', { qos: 0 }, function(err, granted) {});
            client.subscribe(caso.mac + '/vivoconf', { qos: 0 }, function(err, granted) {});
        }
    }
});
subscribeBotonRemoto();
client.subscribe('alta/', { qos: 2 }, function(err, granted) { console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos); });
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

function resetcoloreshab(cual) {
    if (cual == 'todas') {
        laquery = "select mac,colordisp from mac m join dashboard d on m.habitacion=d.habitacion join color c on c.estado=d.estado;";
        conn.query(laquery, function(err, rows) {
            for (var caso of rows) {
                client.publish(caso.mac + '/estado', caso.colordisp, { qos: 2 });
            }
        });
    } else {
        laquery = "select mac,colordisp from mac m join dashboard d on m.habitacion=d.habitacion join color c on c.estado=d.estado where d.habitacion=" + cual + ";";
        conn.query(laquery, function(err, rows) {
            for (var caso of rows) {
                client.publish(caso.mac + '/estado', caso.colordisp, { qos: 2 });
            }
        });
    }
}

//setTimeout(resetcoloreshab2, 2000);
setTimeout(resetcoloreshab.bind(null, 'todas'), 2000);

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

                client.subscribe(caso.cod + '/alta', { qos: 2 }, function(err, granted) { console.log('Subscripto: ' + granted[0].topic + '     qos:' + granted[0].qos); });
                client.subscribe(caso.cod + '/estado', { qos: 2 }, function(err, granted) { console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos); });
                client.subscribe(caso.cod + '/alerta', { qos: 0 }, function(err, granted) { console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos); });
            }
        }
    });
}
//////////  FIN SUBSCRIBIRSE