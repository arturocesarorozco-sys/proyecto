import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'ACOZ1023',   
  database: 'aplicacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
