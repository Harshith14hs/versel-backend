require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harsh:harsh@harsh.m5n2n.mongodb.net/blogjet';
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB successfully');
      return;
    } catch (error) {
      retries++;
      console.log(`MongoDB connection attempt ${retries} failed. Retrying...`);
      if (retries === maxRetries) {
        console.error('Failed to connect to MongoDB after', maxRetries, 'attempts');
        console.error('Please make sure MongoDB is running and accessible');
        process.exit(1);
      }
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Connect to MongoDB
connectWithRetry().then(async () => {
  // Import models
  const Post = require('./models/Post');
  const User = require('./models/User');

  // Helper to get or create the Blogjet Team user
  async function getBlogjetTeamUserId() {
    let user = await User.findOne({ username: 'Blogjet Team' });
    if (!user) {
      user = new User({
        username: 'Blogjet Team',
        email: 'blogjet-team@blogjet.com',
        password: 'blogjetteam123' // Will be hashed
      });
      await user.save();
    }
    return user._id;
  }

  let blogjetTeamUserId = null;
  async function ensureBlogjetTeamUserId() {
    if (!blogjetTeamUserId) {
      blogjetTeamUserId = await getBlogjetTeamUserId();
    }
    return blogjetTeamUserId;
  }

  // Default posts definition (will be set at runtime)
  let defaultPosts = [];

  // Get all posts (from database only)
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await Post.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  });

  // Upsert default posts on server start
  async function upsertDefaultPosts() {
    try {
      const authorId = await getBlogjetTeamUserId();
      const defaultPosts = [
        {
          slug: 'welcome-to-blogjet',
          title: 'Welcome to Blogjet!',
          content: 'This is a default post. Start blogging now!',
          excerpt: 'This is a default post. Start blogging now!',
          image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
          tag: 'Welcome',
          author: authorId,
          isDefault: true
        },
        {
          slug: 'getting-started',
          title: 'Getting Started',
          content: 'Create your first post by clicking Create-Blog.',
          excerpt: 'Create your first post by clicking Create-Blog.',
          image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
          tag: 'Guide',
          author: authorId,
          isDefault: true
        }
      ];
      for (const post of defaultPosts) {
        await Post.findOneAndUpdate(
          { slug: post.slug },
          { $setOnInsert: post },
          { upsert: true, new: true }
        );
      }
      console.log('Default posts upserted.');
    } catch (err) {
      console.error('Error upserting default posts:', err.message);
    }
  }

  // Call upsert function after connecting to MongoDB
  await upsertDefaultPosts();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/tasks', taskRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../build/index.html'));
    });
  }

  // Function to find an available port
  const findAvailablePort = async (startPort) => {
    const net = require('net');
    
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(findAvailablePort(startPort + 1));
        } else {
          reject(err);
        }
      });
      
      server.listen(startPort, () => {
        server.close(() => {
          resolve(startPort);
        });
      });
    });
  };

  // Start server with port handling
  const startServer = async () => {
    try {
      const desiredPort = process.env.PORT || 5000;
      const port = await findAvailablePort(desiredPort);
      
      app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 API Base URL: http://localhost:${port}/api`);
        if (port !== desiredPort) {
          console.log(`⚠️  Note: Original port ${desiredPort} was in use, using ${port} instead`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };

  // Only start the server locally
  if (require.main === module) {
    startServer();
  }
});

// Export the app for Vercel (must be at top level)
module.exports = app; 