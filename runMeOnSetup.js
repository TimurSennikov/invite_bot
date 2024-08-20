const db = require("better-sqlite3")("server.db");

try{
    db.exec("CREATE TABLE states(id NUMBER, state TEXT)");
    db.exec("CREATE TABLE queue(id NUMBER, form TEXT)");
}
catch(e){
    console.log("Run this file ONE time, please!");
}

module.exports = null;