const mysql = require("mysql");
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'nuxt_mysql'
});

con.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('MySQL connected as id ' + con.threadId);
});

module.exports = con;
