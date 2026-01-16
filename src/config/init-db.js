const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u696800077_apjuadmin',
  password: process.env.DB_PASSWORD || 'apju@admin123',
  database: 'mysql', // Connect to default mysql database first
  multipleStatements: true
};

const initDb = async () => {
  try {
    // Create connection without database specified
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`u696800077_apju\`;`);
    console.log('Database created or already exists');

    // Switch to the database
    await connection.query('USE `u696800077_apju`;');

    // Create admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Admin table created or already exists');

    // Create content table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        type ENUM('blog','photo','video') NOT NULL,
        media_url TEXT,
        video_url TEXT,
        show_on_home BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Content table created or already exists');

    // Insert default admin if not exists
    const [adminRows] = await connection.query('SELECT * FROM admin WHERE email = ?', ['apju@admin.com']);
    
    if (adminRows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('apju@admin123', 10);
      
      await connection.query(
        'INSERT INTO admin (email, password) VALUES (?, ?)',
        ['apju@admin.com', hashedPassword]
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
