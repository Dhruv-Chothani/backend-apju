const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "u696800077_apjuadmin",
  password: "apju@admin123",
  database: "u696800077_apju",
});

module.exports = db;
