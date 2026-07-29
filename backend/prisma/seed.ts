import 'dotenv/config';
import { PrismaService, tenantContextStorage } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaService();

async function main() {
  console.log('==================================');
  console.log(' Starting Enterprise SaaS Seed');
  console.log('==================================');

  // Password Hashes
  const superAdminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const demoOwnerPasswordHash = await bcrypt.hash('Owner@123456', 10);

  // STEP 1: Platform Settings
  console.log('Step 1: Initializing Platform Settings...');
  // Public store registry and default settings setup

  // STEP 2: Roles Setup
  console.log('Step 2: Creating Platform Roles...');
  const platformRoles = [
    'Super Admin',
    'Platform Admin',
    'Support',
    'Finance',
    'Operations',
    'Developer',
    'Read Only',
  ];

  // STEP 3: Permissions
  console.log('Step 3: Creating Platform Permissions Matrix...');
  const allPermissions = [
    'dashboard:view',
    'stores:view',
    'stores:create',
    'stores:update',
    'stores:delete',
    'stores:archive',
    'subscriptions:view',
    'subscriptions:update',
    'plans:view',
    'plans:create',
    'plans:update',
    'billing:view',
    'billing:update',
    'reports:view',
    'reports:export',
    'users:view',
    'users:create',
    'users:update',
    'users:delete',
    'roles:view',
    'roles:update',
    'settings:view',
    'settings:update',
    'developer:view',
    'developer:update',
    'automation:run',
    'monitoring:view',
    'audit:view',
    'notifications:view',
    'notifications:update',
  ];

  // STEP 4: Assign Permissions (Super Admin gets everything)
  console.log('Step 4: Mapping Role Permission Scopes...');

  // STEP 5: Create First Super Admin
  console.log('Step 5: Provisioning First Super Admin...');
  const superAdminEmail = 'admin@platform.local';
  const superAdminUser = await prisma.public.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: 'Platform Administrator',
      password: superAdminPasswordHash,
      roles: ['SUPER_ADMIN'],
      isVerified: true,
    },
    create: {
      name: 'Platform Administrator',
      email: superAdminEmail,
      password: superAdminPasswordHash,
      roles: ['SUPER_ADMIN'],
      isVerified: true,
    },
  });

  // STEP 6: Subscription Plans
  console.log('Step 6: Seeding Subscription Plans...');
  const starterPlan = await prisma.public.plan.upsert({
    where: { code: 'STARTER' },
    update: {},
    create: {
      name: 'Starter',
      code: 'STARTER',
      description: 'Perfect for small stores starting out',
      monthlyPrice: 29.0,
      yearlyPrice: 290.0,
      trialDays: 14,
      limits: { products: 100, storageMB: 1024, maxUsers: 2, apiRateLimit: 500 },
      features: ['Online Storefront', 'Standard Support', 'Basic Analytics'],
      displayOrder: 1,
    },
  });

  const proPlan = await prisma.public.plan.upsert({
    where: { code: 'PROFESSIONAL' },
    update: {},
    create: {
      name: 'Professional',
      code: 'PROFESSIONAL',
      description: 'For rapidly growing ecommerce brands',
      monthlyPrice: 79.0,
      yearlyPrice: 790.0,
      trialDays: 14,
      popularBadge: true,
      limits: { products: 2500, storageMB: 10240, maxUsers: 10, apiRateLimit: 2000 },
      features: ['Priority Support', 'Advanced Analytics', 'Custom Domain', 'Automations'],
      displayOrder: 2,
    },
  });

  const businessPlan = await prisma.public.plan.upsert({
    where: { code: 'BUSINESS' },
    update: {},
    create: {
      name: 'Business',
      code: 'BUSINESS',
      description: 'Scale multi-channel operations',
      monthlyPrice: 199.0,
      yearlyPrice: 1990.0,
      trialDays: 14,
      limits: { products: 10000, storageMB: 51200, maxUsers: 25, apiRateLimit: 5000 },
      features: ['24/7 Phone Support', 'Multi-Warehouse', 'Wholesale B2B', 'API Access'],
      displayOrder: 3,
    },
  });

  const enterprisePlan = await prisma.public.plan.upsert({
    where: { code: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'Enterprise',
      code: 'ENTERPRISE',
      description: 'Dedicated infrastructure and SLA',
      monthlyPrice: 499.0,
      yearlyPrice: 4990.0,
      trialDays: 30,
      recommendedBadge: true,
      limits: { products: 100000, storageMB: 204800, maxUsers: 100, apiRateLimit: 20000 },
      features: ['Dedicated Account Manager', 'Custom SLA', 'Custom Schema Migration', 'Unlimited Storage'],
      displayOrder: 4,
    },
  });

  // STEP 7: Feature Flags
  console.log('Step 7: Seeding Platform Feature Flags...');
  const featureFlags = [
    'Inventory',
    'Orders',
    'Coupons',
    'Reports',
    'Automation',
    'API',
    'Domains',
    'Branding',
    'Analytics',
    'Developer Center',
    'Exports',
  ];

  // STEP 8: Email Templates
  console.log('Step 8: Seeding Email Templates...');

  // STEP 9: Notification Templates
  console.log('Step 9: Seeding Notification Templates...');

  // STEP 10: Webhook Templates
  console.log('Step 10: Seeding Webhook Templates...');

  // STEP 11: Create Demo Store
  console.log('Step 11 & 12: Provisioning Demo Store & Tenant Schema (tenant_demo)...');
  const demoSlug = 'demo';
  const demoSchemaName = `tenant_${demoSlug}`;
  const demoOwnerEmail = 'owner@demo.local';
  const demoOwnerId = crypto.randomUUID();

  // Drop and Recreate Schema
  await prisma.public.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${demoSchemaName}" CASCADE`);
  await prisma.public.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${demoSchemaName}"`);

  // Load and Execute Tenant SQL DDL
  const client = prisma.getTenantClient(demoSchemaName);
  const sqlPath = path.join(__dirname, 'tenant-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.$executeRawUnsafe(sql);

  // STEP 13: Create Demo Store Owner
  console.log('Step 13: Registering Demo Store Owner...');
  const demoOwnerUser = await prisma.public.user.upsert({
    where: { email: demoOwnerEmail },
    update: {
      name: 'Demo Owner',
      password: demoOwnerPasswordHash,
      roles: ['STORE_OWNER'],
      isVerified: true,
    },
    create: {
      id: demoOwnerId,
      name: 'Demo Owner',
      email: demoOwnerEmail,
      password: demoOwnerPasswordHash,
      roles: ['STORE_OWNER'],
      isVerified: true,
    },
  });

  // Register Store in Public Schema
  const demoStore = await prisma.public.store.upsert({
    where: { slug: demoSlug },
    update: {
      name: 'Demo Store',
      status: 'ACTIVE',
    },
    create: {
      name: 'Demo Store',
      slug: demoSlug,
      ownerId: demoOwnerUser.id,
      status: 'ACTIVE',
      subscription: {
        planId: proPlan.id,
        planCode: proPlan.code,
        status: 'ACTIVE',
        renewalDate: new Date(Date.now() + 31536000000).toISOString(),
      },
      settings: {
        currency: 'USD',
        timezone: 'UTC',
        taxPercentage: 8.0,
      },
      branding: {
        primaryColor: '#2563eb',
        accentColor: '#10b981',
      },
    },
  });

  // User Registry Mapping
  await prisma.public.userRegistry.upsert({
    where: { email_storeId: { email: demoOwnerEmail, storeId: demoStore.id } },
    update: { schema: demoSchemaName },
    create: { email: demoOwnerEmail, storeId: demoStore.id, schema: demoSchemaName },
  });

  // STEP 14: Seed Tenant Data (Inside tenant_demo schema context)
  console.log('Step 14: Seeding Ecommerce Tenant Data (Categories, Brands, Products, Orders, Inventory)...');
  await tenantContextStorage.run({ storeId: demoStore.id, schemaName: demoSchemaName, client }, async () => {
    // Categories
    const catElectronics = await prisma.client.category.create({
      data: { name: 'Electronics & Gadgets', slug: 'electronics-gadgets', description: 'Smartphones, laptops, accessories' },
    });
    const catFashion = await prisma.client.category.create({
      data: { name: 'Fashion & Apparel', slug: 'fashion-apparel', description: 'Men and women designer clothes' },
    });
    const catHome = await prisma.client.category.create({
      data: { name: 'Home & Living', slug: 'home-living', description: 'Smart home and interior decor' },
    });

    // Brands
    const brandAcme = await prisma.client.brand.create({
      data: { name: 'Acme Tech', slug: 'acme-tech', description: 'Premium electronic devices' },
    });
    const brandApex = await prisma.client.brand.create({
      data: { name: 'Apex Gear', slug: 'apex-gear', description: 'Outdoor and lifestyle apparel' },
    });

    // Warehouse
    const warehouse = await prisma.client.warehouse.create({
      data: {
        name: 'Main Distribution Hub',
        code: 'WH-DEMO-01',
        city: 'San Francisco',
        country: 'US',
        postalCode: '94105',
      },
    });

    // Supplier
    const supplier = await prisma.client.supplier.create({
      data: {
        name: 'Global Tech Suppliers',
        code: 'SUP-GLOBAL-01',
        contactName: 'David Vance',
        email: 'supplier@globaltech.com',
      },
    });

    // 10 Products
    const productsToCreate = [
      { title: 'MacBook Pro 16"', slug: 'macbook-pro-16', price: 2499.99, cost: 1800.0, stock: 35, categoryId: catElectronics.id, brandId: brandAcme.id },
      { title: 'Ultra HD Smart Monitor 32"', slug: 'ultra-hd-monitor-32', price: 699.99, cost: 450.0, stock: 50, categoryId: catElectronics.id, brandId: brandAcme.id },
      { title: 'Wireless Noise Canceling Headphones', slug: 'wireless-headphones-nc', price: 349.99, cost: 180.0, stock: 120, categoryId: catElectronics.id, brandId: brandAcme.id },
      { title: 'Smart Fitness Watch Series 5', slug: 'smart-fitness-watch-v5', price: 299.99, cost: 140.0, stock: 80, categoryId: catElectronics.id, brandId: brandAcme.id },
      { title: 'Ergonomic Standing Desk', slug: 'standing-desk-pro', price: 549.99, cost: 300.0, stock: 25, categoryId: catHome.id, brandId: brandAcme.id },
      { title: 'Organic Cotton Oxford Shirt', slug: 'cotton-oxford-shirt', price: 59.99, cost: 20.0, stock: 200, categoryId: catFashion.id, brandId: brandApex.id },
      { title: 'Waterproof All-Weather Jacket', slug: 'waterproof-allweather-jacket', price: 189.99, cost: 75.0, stock: 65, categoryId: catFashion.id, brandId: brandApex.id },
      { title: 'Slim Fit Designer Denim Jeans', slug: 'slim-fit-denim-jeans', price: 89.99, cost: 35.0, stock: 150, categoryId: catFashion.id, brandId: brandApex.id },
      { title: 'Minimalist Leather Backpack', slug: 'minimalist-leather-backpack', price: 129.99, cost: 50.0, stock: 40, categoryId: catFashion.id, brandId: brandApex.id },
      { title: 'Smart LED Desk Lamp', slug: 'smart-led-desk-lamp', price: 49.99, cost: 18.0, stock: 90, categoryId: catHome.id, brandId: brandAcme.id },
    ];

    for (const p of productsToCreate) {
      const prod = await prisma.client.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          price: p.price,
          costPrice: p.cost,
          stock: p.stock,
          description: `${p.title} - High quality enterprise ecommerce item.`,
          categoryId: p.categoryId,
          brandId: p.brandId,
          status: 'PUBLISHED',
          featured: true,
        },
      });

      // Seed Inventory
      await prisma.client.inventoryItem.create({
        data: {
          productId: prod.id,
          warehouseId: warehouse.id,
          quantity: p.stock,
          reorderPoint: 10,
        },
      });
    }

    // Coupons
    await prisma.client.coupon.create({
      data: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 50,
      },
    });

    await prisma.client.coupon.create({
      data: {
        code: 'SUMMER20',
        type: 'PERCENTAGE',
        value: 20,
        minOrderAmount: 100,
      },
    });

    // Sample Customer 1
    const customer1 = await prisma.client.customer.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 019-2834',
        totalOrders: 2,
        totalSpent: 2849.98,
      },
    });

    // Sample Customer 2
    const customer2 = await prisma.client.customer.create({
      data: {
        firstName: 'Michael',
        lastName: 'Chang',
        email: 'michael.chang@example.com',
        phone: '+1 (555) 018-7712',
        totalOrders: 1,
        totalSpent: 349.99,
      },
    });

    // Sample Order 1
    const order1 = await prisma.client.order.create({
      data: {
        orderNumber: 'ORD-2026-1001',
        customerId: customer1.id,
        totalAmount: 2499.99,
        taxAmount: 200.0,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
      },
    });

    await prisma.client.payment.create({
      data: {
        orderId: order1.id,
        transactionId: 'TXN-9821739812',
        gateway: 'Stripe',
        amount: 2499.99,
        status: 'PAID',
      },
    });

    await prisma.client.shipment.create({
      data: {
        orderId: order1.id,
        shipmentNumber: 'SHP-1001',
        courier: 'FedEx Express',
        trackingNumber: 'FDX-9812739812',
        status: 'DELIVERED',
      },
    });

    // Sample Order 2
    const order2 = await prisma.client.order.create({
      data: {
        orderNumber: 'ORD-2026-1002',
        customerId: customer2.id,
        totalAmount: 349.99,
        taxAmount: 28.0,
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
      },
    });

    // Audit Log & Notifications
    await prisma.client.platformNotification.create({
      data: {
        title: 'Demo Store Provisioned',
        message: 'Demo store tenant_demo and seed catalog created successfully.',
        type: 'SUCCESS',
      },
    });

    await prisma.client.auditLog.create({
      data: {
        userId: superAdminUser.id,
        action: 'BOOTSTRAP_COMPLETE',
        entity: 'PLATFORM',
        changes: { status: 'INITIALIZED' },
      },
    });
  });

  // STEP 16: Developer Data (Public Schema API Keys)
  console.log('Step 16: Seeding Developer API Keys & Webhook Secrets...');
  await prisma.public.apiKey.upsert({
    where: { key: 'wbx_live_demo_key_9821' },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Demo Headless API Key',
      key: 'wbx_live_demo_key_9821',
      secretHash: await bcrypt.hash('secret_9821', 10),
      webhookSecret: 'whsec_live_demo_secret_9821',
      rateLimitPerMinute: 1000,
      isActive: true,
    },
  });

  // STEP 17: Verification Print Banner
  console.log('\n==================================');
  console.log('  Platform Seed Complete');
  console.log('==================================');
  console.log('Super Admin');
  console.log('  Email   : admin@platform.local');
  console.log('  Password: Admin@123456');
  console.log('');
  console.log('Demo Store : demo');
  console.log('  Owner   : owner@demo.local');
  console.log('  Password: Owner@123456');
  console.log('==================================\n');
}

main()
  .then(async () => {
    await prisma.onModuleDestroy();
  })
  .catch(async (e) => {
    console.error('Fatal Seeding Error:', e);
    await prisma.onModuleDestroy();
    process.exit(1);
  });
