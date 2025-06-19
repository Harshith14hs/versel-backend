require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harsh:harsh@harsh.m5n2n.mongodb.net/blogjet';

async function clearPosts() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const result = await Post.deleteMany({});
    console.log(`Deleted ${result.deletedCount} posts.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing posts:', err);
    process.exit(1);
  }
}

clearPosts(); 