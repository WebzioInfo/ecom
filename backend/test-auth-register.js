async function registerAndLogin() {
  try {
    const email = `newuser${Date.now()}@test.com`;
    // Register
    console.log('Registering...');
    const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New User',
        email,
        password: 'Password123!'
      })
    });
    const regData = await regRes.json();
    console.log('Register status:', regRes.status);
    console.log('Register Response:', regData);

    // Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login Response:', loginData);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}
registerAndLogin();
