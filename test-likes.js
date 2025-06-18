const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

async function testLikes() {
  console.log('🧪 Testing Like Functionality...\n');

  try {
    // Get all posts
    console.log('1. Getting all posts...');
    const postsRes = await fetch(`${BASE_URL}/posts`);
    const posts = await postsRes.json();
    console.log('✅ Found posts:', posts.length);

    if (posts.length === 0) {
      console.log('❌ No posts found to test likes');
      return;
    }

    // Show posts with their like counts
    console.log('\n2. Posts and their like counts:');
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" - ${post.likeCount || 0} likes`);
    });

    // Sort posts by like count to show what should be popular
    const sortedByLikes = [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    
    console.log('\n3. Posts sorted by likes (Popular Posts should show the first one):');
    sortedByLikes.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" - ${post.likeCount || 0} likes`);
    });

    console.log('\n4. To test like functionality:');
    console.log('   - Log in to the frontend');
    console.log('   - Click the like button on any post');
    console.log('   - Check that the like count increases');
    console.log('   - Check that the Popular Posts section updates');
    console.log('   - Check the backend console for like logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLikes(); 