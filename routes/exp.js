var express = require('express');
var router = express.Router();
const config = require("config");
const fs = require('fs')
const conn= require('../sql.js');
const client= require('../mqttconf');

const webserver = config.get("webserver");
const webport = config.get("webserverpuerto");
const ambiente = config.get("ambiente");
const titulo = config.get("titulo");


router.get('/', function(req, res) {
  var laquery = "SELECT habitacion,tipohab FROM mac where tipohab <9 and habitacion not in ('enfermeria','desconocida') order by length(habitacion),habitacion;";
  conn.query(laquery, function(err, rows) {
      fs.readFile("routes/exp/simulacion.html", function(err, html) {
          if (err) console.error(err);
          let html_string = html.toString();
          html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
          html_string = html_string.replace(/xyzopqwebserver/g, webserver);
          html_string = html_string.replace(/xyzopqwebport/g, webport);
          html_string = html_string.replace("xyzopqdatodeambiente", ambiente);    
          html_string = html_string.replace(/xyzopqdatodetitulo/g, titulo); 
          res.writeHead(200);
          res.write(html_string);
          res.end();
      });
  });
});

router.get('/comandos.html', function(req, res) {
  var laquery = "SELECT habitacion,tipohab FROM mac where tipohab <9 and habitacion not in ('enfermeria','desconocida') order by length(habitacion),habitacion;";
  conn.query(laquery, function(err, rows) {
      fs.readFile("comandos.html", function(err, html) {
          if (err) console.error(err);
          var html_string = html.toString();
          html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
          html_string = html_string.replace(/xyzopqwebserver/g, webserver);
          html_string = html_string.replace(/xyzopqwebport/g, webport);            
          html_string = html_string.replace(/xyzopqdatodeambiente/g, ambiente);      
          html_string = html_string.replace(/xyzopqdatodetitulo/g, titulo);               
          res.writeHead(200);
          res.write(html_string);
          res.end();
      });
  });
});

router.get('/habitaciones.html', function(req, res) {
  fs.readFile("habitaciones.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/celular.html', function(req, res) {
  fs.readFile("celular.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/mapaestados.html', function(req, res) {
  fs.readFile("mapaestados.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/layout.html', function(req, res) {
  fs.readFile("layout.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/g_prof_race.html', function(req, res) {
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

router.get('/g_demoraprom.html', function(req, res) {
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

router.post('/resethab', function(req, res) {
  console.log("recibio pedido de reiniciar la info de las tablas");
  var laquery = "call reiniciar('sos');";
  conn.query(laquery, function(err, rows) {
      if (!err) { resetcoloreshab('todas') }
  });

  //res.redirect(req.baseUrl + '/');
  res.json([{ 'error': false }]);
});

router.post('/apagardesdeapp', function(req, res) {
  if (req.body.hab == undefined || req.body.quien == undefined || req.body.como == undefined) {
      return res.json([{ 'error': true }]);
  } else {
      if (req.body.como == 'tarjremota') {
          console.log("recibio pedido apagardesdeapp por tarjeta remota");
          var laquery = "call accionhab('apagarremoto',?,?,?);";
          // solamente pone un registro en la tabla apagarremota
          if (req.body.hab.length <= 20 && req.body.quien.length <= 45 && req.body.como.length <= 10) {
              var todo = [req.body.hab, req.body.quien, req.body.como];
              conn.query(laquery, todo, (err, rows, fields) => {
                  if (err) { console.error(err) }
              });
              res.json([{ 'error': false }]);
          }
      } else {
          // opcion en desuso, era para apagar determinada habitacion desde menu.  falta cambiarle el color a la luz de habitacion
          console.log("recibio pedido apagardesdeapp por opcion de pantalla");
          var laquery = "call accionhab('apagar',?,?,?);";
          if (req.body.hab.length <= 20 && req.body.quien.length <= 45 && req.body.como.length <= 10) {
              var todo = [req.body.hab, req.body.quien, req.body.como];
              conn.query(laquery, todo, (err, rows, fields) => {
                  if (err) { console.error(err) } else {
                      client.publish(rows[0][0].mac + '/estado', rows[0][0].color.toString(), { qos: 2 });
                  }
              });
              res.json([{ 'error': false }]);
          }

      }
  }
});

router.get('/profesionales', function(req, res) {
  console.log("recibio  /profesionales");
  var laquery = "SELECT rfid,nombre, DATE_FORMAT(alta, '%d/%m/%Y') as altaf FROM rfid order by alta desc;";
  conn.query(laquery, function(err, rows) {

      fs.readFile("abm_rfid.html", function(err, html) {
          if (err) console.error(err);
          var html_string = html.toString();
          html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
          html_string = html_string.replace(/xyzopqwebserver/g, webserver);
          html_string = html_string.replace(/xyzopqwebport/g, webport);
          res.writeHead(200);
          res.write(html_string);
          res.end();
      });
  });
});

router.post('/rfidmodifica', function(req, res) {
  var rfid = req.body.rfid;
  var profesional = req.body.profesional;
  var laquery = "update rfid set alta=CURRENT_TIMESTAMP,nombre='" + profesional + "' where rfid='" + rfid + "';"
  console.log("recibio pedido de modificar rfid-profesional: " + rfid + "-" + profesional);
  conn.query(laquery, function(err, rows) {
      if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
  });
});

router.post('/rfidbaja', function(req, res) {
  var rfid = req.body.rfid;
  console.log("recibio pedido de baja rfid: " + rfid);
  var laquery = "delete from rfid where rfid='" + rfid + "';";
  conn.query(laquery, function(err, rows) {
      if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
  });
});

router.post('/rfidbajadesconocidas', function(req, res) {
  var laquery = "delete from rfid where nombre='desconocida';";
  console.log(laquery);
  conn.query(laquery, function(err, rows) {
      if (err) { console.log(0); return res.json([{ 'hecho': 0 }]); } else { console.log(1); return res.json([{ 'hecho': 1 }]); }
  });
});

router.get('/dispositivos', function(req, res) {
  //console.log("recibio  /dispositivos");
  var laquery = 'select * from mac order by mac;';
  conn.query(laquery, function(err, rows) {

      fs.readFile("abm_mac.html", function(err, html) {
          if (err) console.error(err);
          var html_string = html.toString();
          html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
          html_string = html_string.replace(/xyzopqwebserver/g, webserver);
          html_string = html_string.replace(/xyzopqwebport/g, webport);
          res.writeHead(200);
          res.write(html_string);
          res.end();
      });
  });
});

router.get('/controles', function(req, res) {
  console.log("recibio  /controles");
  var laquery = 'select mac,habitacion from mac where (rf is not null and length(rf) > 0) order by habitacion;';
  conn.query(laquery, function(err, rows) {

      fs.readFile("abm_rf.html", function(err, html) {
          if (err) console.error(err);
          var html_string = html.toString();
          html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(rows));
          html_string = html_string.replace(/xyzopqwebserver/g, webserver);
          html_string = html_string.replace(/xyzopqwebport/g, webport);
          res.writeHead(200);
          res.write(html_string);
          res.end();
      });
  });
});

router.post('/seteacontroles', function(req, res) {
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

router.post('/macalta', function(req, res) {
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

router.post('/macmodifica', function(req, res) {
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

router.post('/macbaja', function(req, res) {
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

router.post('/status', function(req, res) {
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

router.get('/programartareas.html', function(req, res) {
  fs.readFile("programartareas.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});
router.get('/camas.html', function(req, res) {
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

router.get('/dashboard.html', function(req, res) {
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

router.get('/heladeras.html', function(req, res) {
    var laquery = 'call g_heladera_temperatura(100);';
    conn.query(laquery, function(err, rows) {
        fs.readFile("heladeras.html", function(err, html) {
            if (err) console.error(err);
            var html_string = html.toString();
            html_string = html_string.replace("xyzopqdatosdesdeelserver", rows[1][0].resultado);
            html_string = html_string.replace("xyzopqdatosdesdeelserverrango", rows[0][0].rango);
            res.writeHead(200);
            res.write(html_string);
            res.end();
        });
    });
  });

router.post('/usuario', function(req, res) {
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

router.get('/prueba.html', function(req, res) {
  fs.readFile("prueba.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/demobotonremoto.html', function(req, res) {
    fs.readFile("demobotonremoto.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        html_string = html_string.replace(/xyzopqwebserver/g, webserver);
        html_string = html_string.replace(/xyzopqwebport/g, webport);
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
  });

router.get('/remoto.html', function(req, res) {
  fs.readFile("remoto.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      html_string = html_string.replace(/xyzopqdatodetitulo/g, titulo); 
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/botonremoto.html', function(req, res) {
  fs.readFile("botonremoto.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      html_string = html_string.replace(/xyzopqwebserver/g, webserver);
      html_string = html_string.replace(/xyzopqwebport/g, webport);
      html_string = html_string.replace(/xyzopqdatodetitulo/g, titulo); 
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.post('/remotorecibe', function(req, res) {
  //remotorecibe puede ser obsoleto, estos mensajes de alerta no tienen token, y reemplazado con /remotowebtoken
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
router.post('/remotowebtoken', function(req, res) {
  // el SP RecibeBotonRemoto servirá tanto para la botonera remota WEB com para la app de android
  if (req.body.topico == undefined || req.body.cod == undefined) {
      console.log("ERROR recibio desde botonera remota WEB pero sin el topico o codigo");
      return res.json([{ 'error': true }]);
  } else {
      var topico = req.body.topico;
      var cod = req.body.cod;
      var alerta = req.body.alerta;
      var tokenactual = req.body.tokenactual;
      console.log("recibio desde botonera remota WEB: " + topico + ", Para: " + cod);
  }

  //if (cod <= 17 && topico.length <= 10 && aaaa <= 12 && parseInt(aaaa) <= 999999) {
  laquery = "call RecibeBotonRemoto(?,?,?,?,@resultado,@lamac,@resultadodisp);";
  todo = [cod, topico, alerta, tokenactual];
  console.log(laquery+ ' ' + todo);
  conn.query(laquery, todo, (err, rows, fields) => {
      
      
      
      if (err) {
          console.log('error en la consulta: ' + laquery + ' ' + todo);
      } else {
          // solo hay dos topicos, Alta y Alerta
          if (topico == 'alta' && rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
              var resul = rows[0][0].resultado.split(";");
              var color = resul[0];
              var token = resul[1];
              return res.json([{ 'error': false, 'color': color, 'token': token }]);
          }
          if (topico == 'alerta' && rows[0][0].resultado != '0' && rows[0][0].resultado != undefined) {
              var color = rows[0][0].resultado;
              var colordisp = rows[0][0].resultadodisp;
              var mac=rows[0][0].lamac;
              client.publish(mac + '/estado', colordisp, { qos: 2 });
              console.log(mac + '/estado ' +  colordisp);
              io.to('habitaciones').emit('habitacion', { 'habitacion': rows[0][0].lahabitacion,'color':rows[0][0].color,'estado':rows[0][0].estado });
              return res.json([{ 'error': false, 'color': color }]);
          }
          if (topico == 'alerta' && rows[0][0].resultado == '0' ) {
              // puede ser que el token esté equivocado (999) o que la hab ya está con alerta
            if (rows[0][0].resultadodisp == '999' ) {
              return res.json([{ 'error': false, 'token': 'equivocado' }]);
            }
            else {
             return res.json([{ 'error': false, 'color': rows[0][0].resultadodisp }]); 
            }
          }

      }
  });
  //}
});

router.post('/seteatipohab', function(req, res) {
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

router.get('/consultorios.html', function(req, res) {
  fs.readFile("consultorios.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});

router.get('/consultoriostablero.html', function(req, res) {
  fs.readFile("consultoriostablero.html", function(err, html) {
      if (err) console.error(err);
      var html_string = html.toString();
      res.writeHead(200);
      res.write(html_string);
      res.end();
  });
});


module.exports = router;