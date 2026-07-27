async function login() {
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
    console.log('Login status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}
login();
