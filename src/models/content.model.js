const db = require('../config/db');

const Content = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM content ORDER BY created_at DESC');
    return rows;
  },

  async getHomeContent() {
    const [rows] = await db.query(
      'SELECT * FROM content WHERE show_on_home = true ORDER BY created_at DESC LIMIT 3'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM content WHERE id = ?', [id]);
    return rows[0];
  },

  async create(contentData) {
    const { title, description, content, type, media_url, video_url, show_on_home } = contentData;
    
    const [result] = await db.query(
      `INSERT INTO content 
       (title, description, content, type, media_url, video_url, show_on_home) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, content, type, media_url, video_url, show_on_home || false]
    );
    
    return this.getById(result.insertId);
  },

  async update(id, updates) {
    const { title, description, content, media_url, video_url, show_on_home } = updates;
    
    await db.query(
      `UPDATE content 
       SET title = ?, 
           description = ?, 
           content = ?, 
           media_url = ?, 
           video_url = ?,
           show_on_home = ?,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, description, content, media_url, video_url, show_on_home, id]
    );
    
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM content WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async toggleHomeDisplay(id) {
    const content = await this.getById(id);
    if (!content) return null;
    
    const newStatus = !content.show_on_home;
    await db.query('UPDATE content SET show_on_home = ? WHERE id = ?', [newStatus, id]);
    
    return this.getById(id);
  }
};

module.exports = Content;
