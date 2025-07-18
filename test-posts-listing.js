// Test script for Posts Listing functionality
const API_BASE = 'http://localhost:5000/api';

async function testPostsListing() {
  console.log('🧪 Testing Posts Listing Functionality...\n');

  try {
    // Test 1: Get categories
    console.log('1. Testing categories endpoint...');
    const categoriesRes = await fetch(`${API_BASE}/posts/categories`);
    const categoriesData = await categoriesRes.json();
    console.log('✅ Categories:', categoriesData);

    // Test 2: Get popular tags
    console.log('\n2. Testing popular tags endpoint...');
    const tagsRes = await fetch(`${API_BASE}/posts/popular-tags`);
    const tagsData = await tagsRes.json();
    console.log('✅ Popular tags:', tagsData);

    // Test 3: Get posts with pagination
    console.log('\n3. Testing posts with pagination...');
    const postsRes = await fetch(`${API_BASE}/posts?page=1&per_page=5`);
    const postsData = await postsRes.json();
    console.log('✅ Posts with pagination:', {
      total: postsData.pagination?.total,
      page: postsData.pagination?.page,
      hasNext: postsData.pagination?.has_next,
      postsCount: postsData.posts?.length
    });

    // Test 4: Get posts with search filter
    console.log('\n4. Testing posts with search filter...');
    const searchRes = await fetch(`${API_BASE}/posts?search=thar&page=1&per_page=5`);
    const searchData = await searchRes.json();
    console.log('✅ Search results:', {
      total: searchData.pagination?.total,
      postsCount: searchData.posts?.length
    });

    // Test 5: Get posts with sorting
    console.log('\n5. Testing posts with sorting...');
    const sortRes = await fetch(`${API_BASE}/posts?sort_by=created_at&sort_order=desc&page=1&per_page=5`);
    const sortData = await sortRes.json();
    console.log('✅ Sorted posts:', {
      total: sortData.pagination?.total,
      postsCount: sortData.posts?.length
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📱 Frontend should be available at: http://localhost:5173');
    console.log('🔧 Backend API is running at: http://localhost:5000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testPostsListing(); 