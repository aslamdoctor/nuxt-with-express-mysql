const mysql = require("mysql");
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
});

// Create Connection
con.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('MySQL connected as id ' + con.threadId);
});

// Create Database
const db_name = 'nuxt_mysql';
con.query("CREATE DATABASE IF NOT EXISTS " + db_name, function (err, result) {
  if (err) throw err;
  console.log(`Database "${db_name}" created.`);

  // Select db
  con.changeUser({database : db_name}, function(err) {
    if (err) throw err;
    console.log(`Database "${db_name}" selected.`);

    // Process on Database
    processDatabase();
  });
});


// Process on Database
function processDatabase(){
  Promise.all([
    createArticlesTable(),
    createUsersTable(),
    // add more methods here
  ]).then(() => {
    con.end();
    console.log("MySQL connection closed.");
  });
}

// Create Articles Table
function createArticlesTable(){
  let tablename = 'articles';
  let sql = `CREATE TABLE IF NOT EXISTS ${tablename} (

      id INT AUTO_INCREMENT NOT NULL,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      date_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id)
  )`;
  return createTableHelper(sql, tablename);
}

// Create Users Table
function createUsersTable(){
  let tablename = 'users';
  let sql = `CREATE TABLE IF NOT EXISTS ${tablename} (

      id INT AUTO_INCREMENT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      date_added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      date_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY (email)
  )`;
  return createTableHelper(sql, tablename);
}


// Create Table Helper
function createTableHelper(sql, tablename){
  return new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`Table "${tablename}" created.`);
      resolve(result);
    });
  });
}
