const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Add comment to post
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      post: postId,
      author: req.user.userId
    });

    await comment.save();
    await comment.populate('author', 'username');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = req.body.content;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    console.log('Comment author:', comment.author.toString(), 'User:', req.user.userId);
    if (String(comment.author) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized', author: String(comment.author), user: String(req.user.userId) });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

module.exports = router; 