module.exports = function (options) {
    const socket = options;
    
        socket.emit('welcome', { message: 'Conectado con el servidor SmartSOS', id: socket.id });

        socket.on('i am client', function (data) {
            console.log(data);
            if (data.app == 'habitaciones') {
                socket.join('habitaciones');
            }
        });
        socket.on('disconnect', () => {
           console.log ("IO desconectado");
           socket.leave('habitaciones');
          })
          socket.on("meDesconecto", () => {
            console.log("IO se Desconecta");
            socket.leave('habitaciones');
        });
  

};