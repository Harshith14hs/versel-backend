const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get posts by logged-in user (My Posts) - MUST be before /:id route
router.get('/mine', auth, async (req, res) => {
  try {
    console.log('Fetching posts for user:', req.user.userId);
    const posts = await Post.find({ author: req.user.userId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    console.log('Found posts:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    if (!req.user || !req.user.userId) {
      console.error('Missing or invalid user in token:', req.user);
      return res.status(401).json({ message: 'Invalid or missing authentication. Please log in again.' });
    }
    const { title, content, excerpt, image, tag } = req.body;
    if (!title) console.error('Missing title');
    if (!content) console.error('Missing content');
    if (!excerpt) console.error('Missing excerpt');
    if (!image) console.error('Missing image');
    if (!tag) console.error('Missing tag');
    const post = new Post({
      title,
      content,
      excerpt,
      image,
      tag,
      author: req.user.userId
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, excerpt, image, tag } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.image = image || post.image;
    post.tag = tag || post.tag;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Delete request for post:', req.params.id, 'by user:', req.user.userId);
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('Post not found:', req.params.id);
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log('Post author:', post.author.toString(), 'User:', req.user.userId);
    if (post.author.toString() !== req.user.userId) {
      console.log('Unauthorized delete attempt');
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Use findByIdAndDelete instead of deprecated remove()
    await Post.findByIdAndDelete(req.params.id);
    console.log('Post deleted successfully:', req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (typeof post.likeCount !== 'number') post.likeCount = 0;
    if (!Array.isArray(post.likes)) post.likes = [];

    const userId = req.user.userId;
    // Compare as strings
    const likeIndex = post.likes.map(id => id.toString()).indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
      post.likeCount += 1;
    } else {
      post.likes.splice(likeIndex, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    }

    await post.save();
    await post.populate('author', 'username');

    // Convert likes to string array for frontend
    const postObj = post.toObject();
    postObj.likes = postObj.likes.map(id => id.toString());

    res.json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Error updating like', error: error.message });
  }
});

module.exports = router; 