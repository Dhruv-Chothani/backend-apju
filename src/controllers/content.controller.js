const mongoose = require('mongoose');
const Content = require('../models/content.model');
const { downloadImage, deleteOldImage } = require('../utils/fileDownloader');
const path = require('path');
const fs = require('fs');

/* =========================================================
   FILE UPLOAD
========================================================= */
exports.uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filePath,
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

/* =========================================================
   ADD CONTENT
========================================================= */
exports.addContent = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      type,
      media_url,
      video_url,
      show_on_home,
      imageUrl
    } = req.body;

    let finalMediaUrl = media_url;

    // Download image from URL if provided
    if (imageUrl && /^https?:\/\//.test(imageUrl)) {
      finalMediaUrl = await downloadImage(imageUrl);
    }

    const newContent = new Content({
      title,
      description,
      content: content || '',
      type,
      media_url: finalMediaUrl,
      video_url: video_url || '',
      show_on_home: show_on_home === true || show_on_home === 'true'
    });

    const savedContent = await newContent.save();

    res.status(201).json({
      success: true,
      data: formatContent(savedContent)
    });

  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({ error: 'Failed to add content' });
  }
};

/* =========================================================
   GET ALL CONTENT
========================================================= */
exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content.map(formatContent));
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

/* =========================================================
   GET HOME CONTENT (TOP 3)
========================================================= */
exports.getHomeContent = async (req, res) => {
  try {
    const content = await Content.find({ show_on_home: true })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(content.map(formatContent));
  } catch (error) {
    console.error('Get home content error:', error);
    res.status(500).json({ error: 'Failed to fetch home content' });
  }
};

/* =========================================================
   GET CONTENT BY ID
========================================================= */
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid content ID' });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(formatContent(content));
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

/* =========================================================
   UPDATE CONTENT
========================================================= */
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid content ID' });
    }

    const oldContent = await Content.findById(id);
    if (!oldContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete old image if media_url changed
    if (
      req.body.media_url &&
      oldContent.media_url &&
      req.body.media_url !== oldContent.media_url
    ) {
      deleteOldImage(oldContent.media_url);
    }

    const updated = await Content.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(formatContent(updated));
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
};

/* =========================================================
   DELETE CONTENT
========================================================= */
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid content ID' });
    }

    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.media_url) {
      deleteOldImage(content.media_url);
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
      id: content._id
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

/* =========================================================
   TOGGLE HOME DISPLAY
========================================================= */
exports.toggleHomeDisplay = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid content ID' });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    content.show_on_home = !content.show_on_home;
    await content.save();

    res.json({
      success: true,
      id: content._id,
      show_on_home: content.show_on_home
    });
  } catch (error) {
    console.error('Toggle home display error:', error);
    res.status(500).json({ error: 'Failed to update home display' });
  }
};

/* =========================================================
   HELPER FUNCTION
========================================================= */
function formatContent(item) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  return {
    id: item._id,
    title: item.title,
    description: item.description,
    content: item.content,
    content_type: item.type,

    // ✅ FULL IMAGE URL
    media_url: item.media_url
      ? item.media_url.startsWith('http')
        ? item.media_url
        : `${baseUrl}/uploads/${item.media_url}`
      : null,

    video_url: item.video_url || null,
    show_on_home: item.show_on_home,
    created_at: item.createdAt,
    updated_at: item.updatedAt
  };
}

