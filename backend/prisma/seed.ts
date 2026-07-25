import { PrismaService, tenantContextStorage } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaService();

async function main() {
  console.log('Starting multi-tenant production seed...');

  const passwordHash = await bcrypt.hash('WebzioAdmin2026!', 10);
  const userPasswordHash = await bcrypt.hash('Password123!', 10);

  // Drop old corrupt tenant schemas
  await prisma.public.$executeRawUnsafe('DROP SCHEMA IF EXISTS tenant_electronics_hub CASCADE;');
  await prisma.public.$executeRawUnsafe('DROP SCHEMA IF EXISTS tenant_fashion_boutique CASCADE;');

  // 1. Seed Plans (Public)
  console.log('Seeding Plans...');
  const basicPlan = await prisma.public.plan.upsert({
    where: { code: 'BASIC_MONTHLY' },
    update: {},
    create: {
      name: 'Basic Plan',
      code: 'BASIC_MONTHLY',
      description: 'Ideal for getting started',
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      trialDays: 14,
      limits: { products: 100, storageMB: 1024 },
      features: ['Basic Support', 'Online Store'],
      displayOrder: 1,
    },
  });

  const proPlan = await prisma.public.plan.upsert({
    where: { code: 'PRO_MONTHLY' },
    update: {},
    create: {
      name: 'Pro Plan',
      code: 'PRO_MONTHLY',
      description: 'For growing businesses',
      monthlyPrice: 79.99,
      yearlyPrice: 799.99,
      trialDays: 14,
      popularBadge: true,
      limits: { products: 1000, storageMB: 5120 },
      features: ['Priority Support', 'Online Store', 'Advanced Analytics'],
      displayOrder: 2,
    },
  });


  // 3. Define Tenants (Stores)
  const storesToSeed = [
    {
      name: 'Electronics Hub',
      slug: 'electronics-hub',
      ownerEmail: 'owner@electronics.com',
      planId: proPlan.id,
      brandingColor: '#007BFF',
      products: [
        { title: 'MacBook Pro 14"', description: 'M3 Pro chip, 18GB RAM, 512GB SSD', price: 1999.99, stock: 45, category: 'Laptops', brand: 'Apple', featured: true },
        { title: 'Dell XPS 15', description: 'Intel Core i9, 32GB RAM, 1TB SSD', price: 2199.99, stock: 20, category: 'Laptops', brand: 'Dell', featured: false },
        { title: 'iPhone 15 Pro', description: 'Titanium, A17 Pro chip', price: 999.00, stock: 150, category: 'Electronics', brand: 'Apple', featured: true },
        { title: 'Sony WH-1000XM5', description: 'Wireless Noise Canceling Headphones', price: 398.00, stock: 75, category: 'Electronics', brand: 'Sony', featured: false }
      ],
      warehouseCode: 'WH-ELEC-1',
      couponCode: 'TECH10',
      couponValue: 10
    },
    {
      name: 'Urban Apparel',
      slug: 'urban-apparel',
      ownerEmail: 'owner@apparel.com',
      planId: basicPlan.id,
      brandingColor: '#FF6F61',
      products: [
        { title: 'Classic Cotton T-Shirt', description: '100% Cotton, regular fit', price: 19.99, stock: 500, category: 'Men\'s Clothing', brand: 'Urban Basics', featured: true },
        { title: 'Slim Fit Denim Jeans', description: 'Stretch denim, dark wash', price: 59.99, stock: 200, category: 'Men\'s Clothing', brand: 'Urban Basics', featured: false },
        { title: 'Summer Floral Dress', description: 'Lightweight summer dress', price: 49.99, stock: 120, category: 'Women\'s Clothing', brand: 'Urban Basics', featured: true },
        { title: 'Leather Crossbody Bag', description: 'Genuine leather, adjustable strap', price: 89.99, stock: 45, category: 'Accessories', brand: 'Urban Basics', featured: false }
      ],
      warehouseCode: 'WH-APP-1',
      couponCode: 'SUMMER20',
      couponValue: 20
    }
  ];

  // 4. Provision and Seed Tenants
  for (const st of storesToSeed) {
    const schemaName = `tenant_${st.slug.replace(/-/g, '_')}`;
    console.log(`Provisioning schema: ${schemaName} for store: ${st.name}`);

    // Drop and Recreate Postgres Schema for complete seeding safety
    await prisma.public.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    await prisma.public.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Load and execute schema SQL template
    const client = prisma.getTenantClient(schemaName);
    const sqlPath = path.join(__dirname, 'tenant-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.$executeRawUnsafe(sql);

    // Create user ID manually so we can reference it in registry and schema
    const ownerUserId = crypto.randomUUID();

    // 1. Seed Owner User FIRST to satisfy foreign key constraint
    const user = await prisma.public.user.upsert({
      where: { email: st.ownerEmail },
      update: {},
      create: {
        id: ownerUserId,
        name: `${st.name} Owner`,
        email: st.ownerEmail,
        password: userPasswordHash,
        roles: ['STORE_OWNER'],
        isVerified: true,
      },
    });

    // Seed Store Registry (Public)
    const store = await prisma.public.store.upsert({
      where: { slug: st.slug },
      update: {},
      create: {
        name: st.name,
        slug: st.slug,
        ownerId: ownerUserId,
        status: 'ACTIVE',
        subscription: { planId: st.planId, status: 'ACTIVE', renewalDate: new Date(Date.now() + 31536000000).toISOString() },
        settings: { currency: 'USD', timezone: 'UTC', taxPercentage: 8.5 },
        branding: { primaryColor: st.brandingColor },
      },
    });

    // Seed User Registry Map
    await prisma.public.userRegistry.upsert({
      where: { email_storeId: { email: st.ownerEmail, storeId: store.id } },
      update: {},
      create: { email: st.ownerEmail, storeId: store.id, schema: schemaName },
    });

    // Execute tenant data seeding under context (Tenant Schema)
    await tenantContextStorage.run({ storeId: store.id, schemaName, client }, async () => {
      console.log(`Seeding dynamic tenant data inside ${schemaName}...`);

      // Seed Products
      for (const p of st.products) {
        const prodExists = await prisma.client.product.findFirst({ where: { title: p.title } });
        if (!prodExists) {
          await prisma.client.product.create({
            data: {
              title: p.title,
              description: p.description,
              price: p.price,
              stock: p.stock,
              category: p.category,
              brand: p.brand,
              images: [],
            },
          });
        }
      }

      // Seed Warehouse
      await prisma.client.warehouse.upsert({
        where: { storeId_code: { storeId: store.id, code: st.warehouseCode } },
        update: {},
        create: {
          storeId: store.id,
          name: 'Main Distribution Hub',
          code: st.warehouseCode,
          city: 'San Francisco',
          country: 'US',
        },
      });

      // Seed Coupon
      await prisma.client.coupon.upsert({
        where: { storeId_code: { storeId: store.id, code: st.couponCode } },
        update: {},
        create: {
          storeId: store.id,
          code: st.couponCode,
          type: 'PERCENTAGE',
          value: st.couponValue,
          minOrderAmount: 50,
        },
      });

      // Seed Customer
      const customerEmail = `shopper@${st.slug}.com`;
      const customer = await prisma.client.customer.upsert({
        where: { storeId_email: { storeId: store.id, email: customerEmail } },
        update: {},
        create: {
          storeId: store.id,
          firstName: 'John',
          lastName: 'Doe',
          email: customerEmail,
          totalSpent: 0,
          totalOrders: 0,
          addresses: [{ type: 'SHIPPING', street: '100 Market St', city: 'SF', zip: '94105' }],
        },
      });

      // Seed platform notifications
      await prisma.client.platformNotification.create({
        data: {
          title: 'Store Registered',
          message: `Tenant store ${st.name} is successfully configured.`,
          type: 'SUCCESS',
          storeId: store.id,
        },
      });

      // Seed Audit Logs
      await prisma.client.auditLog.create({
        data: {
          storeId: store.id,
          userId: user.id,
          action: 'STORE_INITIALIZE',
          entity: 'STORE',
          changes: { status: 'ACTIVE' },
        },
      });
    });
  }

  // Seed generic shopper user map (shopper@test.com on Electronics Hub)
  const elecStore = await prisma.public.store.findFirst({ where: { slug: 'electronics-hub' } });
  if (elecStore) {
    const shopperEmail = 'customer@test.com';
    await prisma.public.userRegistry.upsert({
      where: { email_storeId: { email: shopperEmail, storeId: elecStore.id } },
      update: { schema: 'tenant_electronics_hub' },
      create: { email: shopperEmail, storeId: elecStore.id, schema: 'tenant_electronics_hub' },
    });
    await prisma.public.user.upsert({
      where: { email: shopperEmail },
      update: { password: userPasswordHash, roles: ['USER'], isVerified: true },
      create: { name: 'Test Customer', email: shopperEmail, password: userPasswordHash, roles: ['USER'], isVerified: true },
    });

    const managerEmail = 'manager@electronics.com';
    await prisma.public.userRegistry.upsert({
      where: { email_storeId: { email: managerEmail, storeId: elecStore.id } },
      update: { schema: 'tenant_electronics_hub' },
      create: { email: managerEmail, storeId: elecStore.id, schema: 'tenant_electronics_hub' },
    });
    await prisma.public.user.upsert({
      where: { email: managerEmail },
      update: { password: userPasswordHash, roles: ['STORE_MANAGER'], isVerified: true },
      create: { name: 'Test Manager', email: managerEmail, password: userPasswordHash, roles: ['STORE_MANAGER'], isVerified: true },
    });

    const employeeEmail = 'employee@electronics.com';
    await prisma.public.userRegistry.upsert({
      where: { email_storeId: { email: employeeEmail, storeId: elecStore.id } },
      update: { schema: 'tenant_electronics_hub' },
      create: { email: employeeEmail, storeId: elecStore.id, schema: 'tenant_electronics_hub' },
    });
    await prisma.public.user.upsert({
      where: { email: employeeEmail },
      update: { password: userPasswordHash, roles: ['STORE_EMPLOYEE'], isVerified: true },
      create: { name: 'Test Employee', email: employeeEmail, password: userPasswordHash, roles: ['STORE_EMPLOYEE'], isVerified: true },
    });
  }

  // Seed Super Admin (Platform)
  const superAdminEmail = 'admin@platform.com';
  await prisma.public.user.upsert({
    where: { email: superAdminEmail },
    update: { password: userPasswordHash, roles: ['SUPER_ADMIN'], isVerified: true },
    create: { name: 'Platform Admin', email: superAdminEmail, password: userPasswordHash, roles: ['SUPER_ADMIN'], isVerified: true },
  });

  console.log('✅ Multi-tenant seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.onModuleDestroy();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.onModuleDestroy();
    process.exit(1);
  });
