async function testLogin() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'owner@electronics.com',
        password: 'Password123!'
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('BODY:', data);
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

testLogin();
