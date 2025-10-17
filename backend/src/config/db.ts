const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Kết nối với database thành công.');
        connection.release();
    } catch (error) {
        console.error('Lỗi kết nối với database thất bại:', error);
    }  
})();

export default pool;