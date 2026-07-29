const http = require('http');
const { PrismaClient } = require('@prisma/public-client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  max: 2,
  idleTimeoutMillis: 30000,
});
pool.on('connect', (client) => {
  client.query('SET search_path TO "public"');
});

const adapter = new PrismaPg(pool, { schema: 'public' });
const prisma = new PrismaClient({ adapter });

function post(pathUrl, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1' + pathUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    const staffEmail = 'staff1@gmail.com';
    
    // 1. Set staff1@gmail.com password in DB
    console.log(`Setting password for ${staffEmail} in DB...`);
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    await prisma.user.update({
      where: { email: staffEmail },
      data: { password: hashedPassword }
    });
    console.log('Password successfully set to Password123!');

    // 2. Login as Staff
    console.log(`\nLogging in as ${staffEmail}...`);
    const loginRes = await post('/auth/login', {
      email: staffEmail,
      password: 'Password123!'
    }, {
      'x-store-slug': 'biofix'
    });

    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.body);
      return;
    }

    // Handle TransformInterceptor wrapper
    const responseData = loginRes.body.data || loginRes.body;
    const { access_token, user } = responseData;
    console.log('Logged In User Details:');
    console.log('- Role:', user.role);
    console.log('- Roles (Global):', user.roles);
    console.log('- Permissions:', user.permissions);

    // 3. Attempt to create a product
    console.log('\nAttempting to create product as staff1...');
    const prodRes = await post('/products', {
      title: 'Staff Product ' + Date.now(),
      slug: 'staff-product-' + Date.now(),
      variants: [
        {
          title: 'Default',
          sku: 'SKU-STAFF-' + Date.now(),
          price: 49.99,
          stock: 50
        }
      ]
    }, {
      'Authorization': `Bearer ${access_token}`,
      'x-store-slug': 'biofix'
    });

    console.log('Create Product Status:', prodRes.status);
    console.log('Create Product Response:', prodRes.body);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
