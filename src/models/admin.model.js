const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT id, email, created_at FROM admin WHERE id = ?', [id]);
    return rows[0];
  },

  async create(adminData) {
    const { email, password } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO admin (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    return this.findById(result.insertId);
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = Admin;
