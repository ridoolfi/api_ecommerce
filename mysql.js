const mysql = require('mysql2')

const pool = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'fastfood',
    host: 'localhost',
    port: '3306'
});

module.exports = {pool}
