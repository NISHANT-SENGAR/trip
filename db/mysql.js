var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});


connection.connect((err) => {
    if (err) throw err;
    console.log('connected!');
});

module.exports = connection;