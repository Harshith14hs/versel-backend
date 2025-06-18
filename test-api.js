const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Blog App API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);

    // Test auth test endpoint
    console.log('\n2. Testing auth test endpoint...');
    const authTestRes = await fetch(`${BASE_URL}/auth/test`);
    const authTestData = await authTestRes.json();
    console.log('✅ Auth test:', authTestData);

    // Test posts endpoint
    console.log('\n3. Testing posts endpoint...');
    const postsRes = await fetch(`${BASE_URL}/posts`);
    const postsData = await postsRes.json();
    console.log('✅ Posts count:', postsData.length);

    console.log('\n🎉 All basic tests passed!');
    console.log('\nTo test "My Posts" functionality:');
    console.log('1. Start the frontend: cd ../ && npm start');
    console.log('2. Register/login in the frontend');
    console.log('3. Create some posts');
    console.log('4. Click "My Posts" in the sidebar');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI(); 