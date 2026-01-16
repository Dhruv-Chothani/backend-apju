const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "srv440.hstgr.io",
  user: "u696800077_apjuadmin",
  password: "apju@admin123",
  database: "u696800077_apju",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;
