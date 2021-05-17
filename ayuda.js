function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

$(document).ready(function () { });

localStorage.removeItem("cod");
var cod = localStorage.getItem("cod");
localStorage.setItem("simulacion",val);

var images = [];
function preload() {
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
    }
}
preload(
    "assets/img/alerta1.png",
    "assets/img/alerta2.png",
    "assets/img/alerta3.png",
    "assets/img/alerta4.png",
    "assets/img/alerta5.png"
)

global.nadador=  (n) => {
    console.log('------------------------------------');
    console.log('---    ' + n);
    console.log('------------------------------------');
  }

 
functions.js look  like:
        "use strict";
        module.exports.echo = function echo(input) {
            process.stdout.write(input);
        }
Then in your main script do something like:
    var functions = require("./functions.js");
    functions.echo("Hello, World");        


    $("#boton2").attr('onClick', 'enviaalerta(3)');   
    $("#boton2").attr('onClick', ''); 