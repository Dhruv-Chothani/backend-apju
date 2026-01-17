const Content = require('../models/content.model');

// ADD CONTENT
exports.addContent = async (req, res) => {
  try {
    const { title, description, media_url, type, video_url, show_on_home } = req.body;

    const newContent = new Content({
      title,
      description,
      media_url,
      type: type || 'other',
      video_url: video_url || null,
      show_on_home: show_on_home || false,
      content: req.body.content || ''
    });

    const savedContent = await newContent.save();
    res.status(201).json(savedContent);
  } catch (error) {
    console.error("ADD CONTENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL CONTENT
exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error("GET ALL CONTENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET HOME CONTENT
exports.getHomeContent = async (req, res) => {
  try {
    const homeContent = await Content.getHomeContent();
    res.json(homeContent);
  } catch (error) {
    console.error("GET HOME CONTENT ERROR:", error);
    res.status(500).json({ error: "Failed to fetch home content" });
  }
};
