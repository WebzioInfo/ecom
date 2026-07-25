const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'test@test.com',
      password: 'password123'
    }, {
      headers: {
        'x-store-slug': 'acme'
      }
    });
    console.log("STATUS:", res.status);
    console.log("BODY:", res.data);
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("BODY:", err.response?.data);
  }
}

testLogin();
