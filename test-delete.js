const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

async function testDelete() {
  console.log('🧪 Testing Delete Post Functionality...\n');

  try {
    // First, get all posts to see what's available
    console.log('1. Getting all posts...');
    const postsRes = await fetch(`${BASE_URL}/posts`);
    const posts = await postsRes.json();
    console.log('✅ Found posts:', posts.length);

    if (posts.length === 0) {
      console.log('❌ No posts found to test deletion');
      return;
    }

    // Show the first post details
    const firstPost = posts[0];
    console.log('\n2. First post details:');
    console.log('   ID:', firstPost._id);
    console.log('   Title:', firstPost.title);
    console.log('   Author:', firstPost.author?.username || firstPost.author);

    console.log('\n3. To test delete functionality:');
    console.log('   - Log in to the frontend');
    console.log('   - Create a post');
    console.log('   - Click the delete button (trash icon) on your post');
    console.log('   - Check the browser console for logs');
    console.log('   - Check the backend console for logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDelete(); 