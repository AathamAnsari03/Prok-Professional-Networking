// Simple test script to verify authentication endpoints
const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  // Test 1: Signup
  console.log('1. Testing user signup...');
  try {
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'TestPass123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('   Signup result:', signupData.success ? '✅ Success' : '❌ Failed');
    if (!signupData.success) console.log('   Error:', signupData.message);
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  // Test 2: Login
  console.log('\n2. Testing user login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'testuser2',
        password: 'TestPass123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('   Login result:', loginData.success ? '✅ Success' : '❌ Failed');
    if (loginData.success) {
      console.log('   Token received:', loginData.token ? '✅' : '❌');
      console.log('   User data received:', loginData.user ? '✅' : '❌');
    } else {
      console.log('   Error:', loginData.message);
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  // Test 3: Invalid login
  console.log('\n3. Testing invalid login...');
  try {
    const invalidResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'nonexistent',
        password: 'wrongpassword'
      })
    });
    const invalidData = await invalidResponse.json();
    console.log('   Invalid login result:', !invalidData.success ? '✅ Correctly rejected' : '❌ Should have failed');
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  console.log('\n🎉 Authentication tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Open http://localhost:5173 in your browser');
  console.log('   2. You should be redirected to login page');
  console.log('   3. Use credentials: testuser2 / TestPass123');
  console.log('   4. After login, you should see the full app interface');
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testAuth().catch(console.error);
} 