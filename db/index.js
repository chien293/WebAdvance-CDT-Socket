const mysql = require("mysql2/promise");

const db = { connection: null };

(async () => {
  db.connection = await mysql.createConnection({
    host: "mysql-159680-0.cloudclusters.net",
    port: 13142,
    user: "admin",
    password: "1yQrR1vX",
    database: "advanceweb",
    multipleStatements: true
  });
  console.log("Database connected!");
})();

module.exports = db;