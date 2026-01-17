const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'image', 'blog', 'other']
  },
  media_url: {
    type: String,
    required: false
  },
  video_url: {
    type: String,
    required: false
  },
  show_on_home: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add static methods
contentSchema.statics.getHomeContent = async function() {
  return this.find({ show_on_home: true })
    .sort({ createdAt: -1 })
    .limit(3);
};

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
