const mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "nuxt_mysql"
});

con.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("MySQL connected as id " + con.threadId);
});

module.exports = con;
