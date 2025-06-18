const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Add text index for search functionality
postSchema.index({ title: 'text', content: 'text', tag: 'text' });

module.exports = mongoose.model('Post', postSchema); 