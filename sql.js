const mysql = require('mysql');
const config = require("config");
const sqlhost = config.get("sqlserver.host");
const sqluser = config.get("sqlserver.user");
const sqlpassword = config.get("sqlserver.password");
const sqldatabase = config.get("sqlserver.database");
const conn = mysql.createPool({
    connectionLimit: 3, //important
    host: sqlhost,
    user: sqluser,
    password: sqlpassword,
    database: sqldatabase,
    debug: false
});
module.exports = conn;