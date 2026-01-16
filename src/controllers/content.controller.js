const db = require("../config/db");

// ADD CONTENT
exports.addContent = async (req, res) => {
  try {
    const { title, description, media_url, content_type, show_on_home } = req.body;

    const sql = `
      INSERT INTO content 
      (title, description, media_url, content_type, show_on_home)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      title,
      description,
      media_url,
      content_type,
      show_on_home ? 1 : 0,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("ADD CONTENT ERROR:", error);
    res.status(500).json({ error: "Failed to add content" });
  }
};

// GET ALL CONTENT
exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM content ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("GET ALL CONTENT ERROR:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

// GET HOME CONTENT
exports.getHomeContent = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM content WHERE show_on_home = 1 ORDER BY created_at DESC LIMIT 3"
    );
    res.json(rows);
  } catch (error) {
    console.error("GET HOME CONTENT ERROR:", error);
    res.status(500).json({ error: "Failed to fetch home content" });
  }
};
