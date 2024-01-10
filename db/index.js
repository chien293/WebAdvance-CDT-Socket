const mysql = require("mysql2/promise");

const db = { connection: null };

(async () => {
  db.connection = await mysql.createConnection({
    host: "mysql-160219-0.cloudclusters.net",
    port: "18857",
    user: "admin",
    password: "FTSo4f86",
    database: "advanceweb",
    multipleStatements: true,
  });
  console.log("Database connected!");
})();

module.exports = db;