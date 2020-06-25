const timeoutSQL = 500; //cuanto tiempo esperar entre la conexion SQL y la consulta
var mqtt = require('mqtt');
const fs = require('fs')
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser')

/////////////// algunos seteos conexion SQL y WEB
const conn = mysql.createPool({
    connectionLimit: 3, //important
    host: 'localhost',
    user: 'frombakend',
    password: 'backendpass',
    database: 'desarrollo',
    debug: false
});
var app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/////////////// fin algunos seteos conexion SQL y WEB


///////////////////// conexion por MQTT
options = {
    clientId: "ariel",
    username: "UsuarioSOS",
    password: "SOS2020",
    keepalive: 0,
    qos: 2,
    clean: false
};
var client = mqtt.connect("mqtt://localhost", options);
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
            // no hay mac que comience con P  entonces se trata de un boton remoto
            if (parte[0].length <= 17 && parte[1].length <= 10 && accion[0].length <= 12 && parseInt(accion[1]) < 999) {
                laquery = "call RecibeBotonRemoto(?,?,?,?, @resultado);";
                todo = [parte[0], parte[1], accion[0], accion[1]];
                conn.query(laquery, todo, (err, rows, fields) => {
                    if (err) {
                        console.log('error en la consulta: ' + laquery + ' ' + todo);
                    } else {
                        if (rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
                            client.publish(parte[0] + '/estado', rows[0][0].resultado.toString(), { qos: 2 });
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
            }
        }
    });
    laquery = "select mac,colordisp from mac m join dashboard d on m.habitacion=d.habitacion join color c on c.estado=d.estado where mac='" + mac + "';";
    conn.query(laquery, function(err, rows) {
        if (rows.length > 0) {
            client.publish(rows[0]['mac'] + '/estado', rows[0]['colordisp'], { qos: 2 });
        }
    });
}



////////// SUBSCRIBIRSE
let laquery = "SELECT mac FROM mac order by mac asc;";
let todo = [];
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
                client.subscribe(caso.mac + '/alta', { qos: 2 }, function(err, granted) {});
                client.subscribe(caso.mac + '/estado', { qos: 2 }, function(err, granted) {});
                client.subscribe(caso.mac + '/alerta', { qos: 0 }, function(err, granted) {});
            }
        }
    });
}
//////////  FIN SUBSCRIBIRSE

//////////// fin conexion MQTT


////////////  configuracion WEB
app.use('/assets/', express.static('assets/')) ///// borrarlo es solo por la compatibilidad entre mi pc y el server
//app.use('/graficos/', express.static('graficos/'))

app.get('/', function(req, res) {
    var laquery = "SELECT habitacion,tipohab FROM mac where tipohab <9 and habitacion not in ('enfermeria','desconocida') order by length(habitacion),habitacion;";
    conn.query(laquery, function(err, rows) {
        fs.readFile("comandos.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.get('/comandos.html', function(req, res) {
    var laquery = "SELECT habitacion,tipohab FROM mac where tipohab <9 and habitacion not in ('enfermeria','desconocida') order by length(habitacion),habitacion;";
    conn.query(laquery, function(err, rows) {
        fs.readFile("comandos.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});






app.get('/habitaciones.html', function(req, res) {
    fs.readFile("habitaciones.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/celular.html', function(req, res) {
    fs.readFile("celular.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/mapaestados.html', function(req, res) {
    fs.readFile("mapaestados.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/layout.html', function(req, res) {
    fs.readFile("layout.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/g_prof_race.html', function(req, res) {
    var laquery = 'call g_prof_race(7);';
    conn.query(laquery, function(err, rows) {
        fs.readFile("g_prof_race.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", rows[0][0].resultado);
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.get('/g_demoraprom.html', function(req, res) {
    var laquery = 'call g_demoraprom(7);';
    conn.query(laquery, function(err, rows) {
        fs.readFile("g_demoraprom.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", rows[0][0].resultado);
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.post('/resethab', function(req, res) {
    console.log("recibio pedido de reiniciar la info de las tablas");
    var laquery = "call reiniciar('sos');";
    conn.query(laquery, function(err, rows) {
        if (!err) {resetcoloreshab('todas')}
    });
    
    //res.redirect(req.baseUrl + '/');
    res.json([{ 'error': false }]);
});

app.post('/apagardesdeapp', function(req, res) {
    if (req.body.hab == undefined || req.body.quien == undefined || req.body.como == undefined) {
        return res.json([{ 'error': true }]);
    } else {
        if (req.body.como == 'tarjremota') {
            console.log("recibio pedido apagardesdeapp por tarjeta remota");
            var laquery = "call accionhab('apagarremoto',?,?,?);";
            // opcion en desuso, era para apagar determinada habitacion desde menu.  falta cambiarle el color a la luz de habitacion
        } else {
            console.log("recibio pedido apagardesdeapp por opcion de pantalla");
            // solamente pone un registro en la tabla apagarremota
            var laquery = "call accionhab('apagar',?,?,?);";
        }
        if (req.body.hab.length <= 20 && req.body.quien.length <= 45 && req.body.como.length <= 10) {
            var todo = [req.body.hab, req.body.quien, req.body.como];
            conn.query(laquery, todo, (err, rows, fields) => {
                if (err) {console.error(err)}
            });
            
            res.json([{ 'error': false }]);
        }
    }
});

app.get('/profesionales', function(req, res) {
    console.log("recibio  /profesionales");
    var laquery = "SELECT rfid,nombre, DATE_FORMAT(alta, '%d/%m/%Y') as altaf FROM rfid order by alta desc;";
    conn.query(laquery, function(err, rows) {

        fs.readFile("abm_rfid.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.post('/rfidmodifica', function(req, res) {
    var rfid = req.body.rfid;
    var profesional = req.body.profesional;
    var laquery = "update rfid set alta=CURRENT_TIMESTAMP,nombre='" + profesional + "' where rfid='" + rfid + "';"
    console.log("recibio pedido de modificar rfid-profesional: "+ rfid + "-" + profesional);
    conn.query(laquery, function(err, rows) {
        if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
    });
});

app.post('/rfidbaja', function(req, res) {
    var rfid = req.body.rfid;
    console.log("recibio pedido de baja rfid: " + rfid );
    var laquery = "delete from rfid where rfid='" + rfid + "';";
    conn.query(laquery, function(err, rows) {
        if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
    });
});

app.post('/rfidbajadesconocidas', function(req, res) {
    var laquery = "delete from rfid where nombre='desconocida';";
    console.log(laquery);
    conn.query(laquery, function(err, rows) {
        if (err) { console.log(0); return res.json([{ 'hecho': 0 }]); } else { console.log(1); return res.json([{ 'hecho': 1 }]); }
    });
});

app.get('/dispositivos', function(req, res) {
    console.log("recibio  /dispositivos");
    var laquery = 'select * from mac order by mac;';
    conn.query(laquery, function(err, rows) {

        fs.readFile("abm_mac.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.get('/controles', function(req, res) {
    console.log("recibio  /controles");
    var laquery = 'select mac,habitacion from mac where (rf is not null and length(rf) > 0) order by habitacion;';
    conn.query(laquery, function(err, rows) {

        fs.readFile("abm_rf.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});
app.post('/seteacontroles', function(req, res) {
    console.log("recibio pedido de setear controles");
    var mac = req.body.mac;
    var datos = req.body.datos;
    var pos;
    var codigo;
    client.subscribe(mac + '/controles', { qos: 2 }, function(err, granted) {
        if (err) {
            console.log("--> no pudo subscribirse para setear controles a " + mac);
            return res.json([{ 'error': '1' }]);
        } else {

            for (i = 0; i < datos.length; i++) {
                pos = datos[i].pos;
                codigo = datos[i].codigo;
                // no pudo funcionar el callback de publish
                client.publish(mac + '/controles', pos + ';' + codigo, { qos: 2 }, function(err) {});
            }
            return res.json([{ 'error': '0' }]);
            client.unsubscribe(mac + '/controles', 0, function(err) {});
        }
    });
});


app.post('/macalta', function(req, res) {
    console.log("recibio pedido de alta mac");
    var mac = req.body.mac;
    var habitacion = req.body.habitacion;
    var rf = req.body.rf;
    if (rf != null && rf.length == 0) { rf = null } else { rf = "'" + rf + "'" }
    var laquery = "select mac from mac where mac='" + mac + "';";
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log(err);
            return res.json([{ 'error': 'No se conectó a la base de datos' }]);
        } else {
            //length==0 significa no hubo resultados, no hay link o paso el tiempo. En este caso es que no se duplicará
            if (rows.length == 0) {
                var laquery = "insert into mac (mac,habitacion,rf) values ('" + mac + "' , '" + habitacion + "'," + rf + ")";
                conn.query(laquery, function(err, rows) {
                    if (err) { return res.json([{ 'error': 'No se grabó, el formato de los datos no es aceptado, tal vez sea la longitud de ellos' }]); } else {
                        client.subscribe(req.body.mac + '/alerta', { qos: 2 }, function(err, granted) {
                            if (err) {
                                console.log("--> no pudo subscribirse a " + caso.mac);
                                return res.json([{ 'hecho': 1, 'error': '0' }]);
                            } else {
                                console.log('Subscripto: ' + granted[0].topic + '   qos:' + granted[0].qos);
                                client.subscribe(req.body.mac + '/rfid', { qos: 2 }, function(err, granted) {});
                                client.subscribe(req.body.mac + '/estado', { qos: 2 }, function(err, granted) {});
                                client.subscribe(req.body.mac + '/vivo', { qos: 0 }, function(err, granted) {});
                                client.subscribe(req.body.mac + '/vivoconf', { qos: 0 }, function(err, granted) {});
                                return res.json([{ 'hecho': 2, 'error': '0' }]);
                            }
                        });
                    }
                });
                // esto es para dar de alta la habitacion si es que no existe
                laquery = "INSERT INTO dashboard (habitacion) SELECT * FROM (SELECT  '" + habitacion + "') AS tmp WHERE NOT EXISTS ( SELECT 1 FROM dashboard WHERE habitacion = '" + habitacion + "') LIMIT 1;"
                conn.query(laquery, function(err, rows) {});
            } else {
                return res.json([{ 'repetido': 1, 'error': '0' }]);
            }
        }

    });
});

app.post('/macmodifica', function(req, res) {
    console.log("recibio pedido de modificar mac-habitacion");
    var mac = req.body.mac;
    var habitacion = req.body.habitacion;
    var rf = req.body.rf;
    if (rf != null && rf.length == 0) { rf = null } else { rf = "'" + rf + "'" }
    var laquery = "UPDATE mac SET habitacion = '" + habitacion + "',rf = " + rf + " WHERE mac = '" + mac + "';"
    conn.query(laquery, function(err, rows) {
        if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
    });
    // esto es para dar de alta la habitacion si es que no existe
    laquery = "INSERT INTO dashboard (habitacion) SELECT * FROM (SELECT  '" + habitacion + "') AS tmp WHERE NOT EXISTS ( SELECT 1 FROM dashboard WHERE habitacion = '" + habitacion + "') LIMIT 1;"
    conn.query(laquery, function(err, rows) {});

});

app.post('/macbaja', function(req, res) {
    console.log("recibio pedido de baja mac");
    var mac = req.body.mac;
    var laquery = "delete from mac where mac='" + mac + "';";
    //console.log(laquery);
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log(err);
            return res.json([{ 'error': 'No se conectó a la base de datos' }]);
        } else {
            client.unsubscribe(req.body.mac + '/alerta', 0, function(err) {
                if (err) {
                    console.log("--> falló el pedido de des-subscribirse a " + caso.mac);
                    return res.json([{ 'hecho': 1, 'error': '0' }]);
                }
                client.unsubscribe(req.body.mac + '/rfid', { qos: 2 }, function(err, granted) {});
                client.unsubscribe(req.body.mac + '/estado', { qos: 2 }, function(err, granted) {});
                client.unsubscribe(req.body.mac + '/vivo', { qos: 0 }, function(err, granted) {});
                client.unsubscribe(req.body.mac + '/vivoconf', { qos: 0 }, function(err, granted) {});
                return res.json([{ 'hecho': 2, 'error': '0' }]);
            });
        };

    });
});

app.post('/status', function(req, res) {
    //console.log("recibio pedido de status");
    var laquery = 'select d.*,color,mac.ultrespuesta, DATE_FORMAT(TIMEDIFF(current_timestamp,d.desde), "%H:%i" ) as antiguedad,mac.tipohab from dashboard d left join color c on d.estado=c.estado join mac on d.habitacion=mac.habitacion;';
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        }
        //console.log(rows);
        res.json(rows);
    });
});

app.get('/programartareas.html', function(req, res) {
    fs.readFile("programartareas.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});
app.get('/camas.html', function(req, res) {
    var laquery = 'SELECT TRIM(habitacion) as habitacion,TRIM(cama) as cama,TRIM(Paciente) as Paciente FROM camas order by LENGTH (habitacion),habitacion,cama;';
    conn.query(laquery, function(err, rows) {
        fs.readFile("camas.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.get('/camas2.html', function(req, res) {
    var laquery = 'SELECT TRIM(habitacion) as habitacion,TRIM(cama) as cama,TRIM(Paciente) as Paciente FROM camas order by LENGTH (habitacion),habitacion,cama;';
    conn.query(laquery, function(err, rows) {
        fs.readFile("camas2.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.get('/dashboard.html', function(req, res) {
    var laquery = 'call g_dashboard(7);';
    conn.query(laquery, function(err, rows) {
        fs.readFile("dashboard.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", rows[0][0].resultado);
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
});

app.post('/usuario', function(req, res) {
    console.log("recibio pedido logueo");
    var laquery = "select grupo from usuarios where usuario=? and password=?;";
    var todo = [req.body.usuario, req.body.pass];
    if (req.body.usuario == undefined || req.body.pass == undefined) {
        return res.json([{ 'error': true, 'grupo': 'basico' }]);
    }
    conn.query(laquery, todo, (err, rows, fields) => {
        if (err) console.error(err);
        if (rows.length == 0) { return res.json([{ 'error': true, 'grupo': 'basico' }]); } else { return res.json([{ 'error': false, 'grupo': rows[0].grupo }]); }
    });
});

app.get('/prueba.html', function(req, res) {
    fs.readFile("prueba.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/remoto.html', function(req, res) {
    fs.readFile("remoto.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/remotorecibe', function(req, res) {
    console.log("recibio msg en formaremota");
    //console.log(req.body.hab);
    //console.log(req.body.alerta);
    if (req.body.hab == undefined || req.body.alerta == undefined) {
        return res.json([{ 'error': true }]);
    } else {
        //acá repite los codigos que se usarían si vinieran por mqtt
        if (req.body.hab.length <= 2 && req.body.alerta.length <= 10 && parseInt(req.body.cama) < 999) {
            var laquery = "call RecibeMSGremoto(?,?,?, @resultado);";
            var todo = [req.body.hab, req.body.alerta, parseInt(req.body.cama)];
            conn.query(laquery, todo, (err, rows, fields) => {
                //console.log("call RecibeMSGremoto(" + req.body.hab + "," + req.body.alerta + ", @resultado);");

                if (err) {
                    console.log('error en la consulta: ' + laquery + ' ' + todo);
                    return res.json([{ 'error': true }]);
                } else {
                    //if (rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
                    //client.publish(parte[0] + '/estado', rows[0][0].resultado.toString(), { qos: 2 });
                    return res.json([{ 'error': false }]);
                    //}
                }

            });
        }
    }
});

app.post('/seteatipohab', function(req, res) {
    var laquery;
    var todo;
    var algunerror = false;
    var respuesta = JSON.parse(req.body.data);
    for (var caso of respuesta) {
        //console.log(caso.hab);
        laquery = "update mac set tipohab=? where habitacion=?;";
        todo = [caso.maxaisla, '' + caso.hab + ''];

        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {
                console.log('error en la consulta: ' + laquery + ' ' + todo);
                algunerror = true;
            }
        });
    }
    if (algunerror) {
        return res.json([{ 'error': 1 }]);
    } else {
        return res.json([{ 'error': 0 }]);
    }


});

app.listen(3001, function() {
    console.log('web server escuchando en el puerto 3001');

    ////////////  fin configuracion WEB

});