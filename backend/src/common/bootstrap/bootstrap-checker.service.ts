import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BootstrapCheckerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapCheckerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      // 1. Verify Super Admin exists
      const superAdmin = await this.prisma.public.user.findFirst({
        where: {
          roles: {
            has: 'SUPER_ADMIN',
          },
        },
      });

      if (!superAdmin) {
        this.logger.warn('====================================================');
        this.logger.warn('⚠️  [BOOTSTRAP WARNING] NO SUPER ADMIN USER FOUND');
        this.logger.warn('To initialize platform credentials, run:');
        this.logger.warn('  npm run seed');
        this.logger.warn('====================================================');
      } else {
        this.logger.log(`✅ [BOOTSTRAP CHECK] Active Super Admin account verified (${superAdmin.email})`);
      }

      // 2. Migrate existing tenant databases for RBAC tables (TenantRole & TeamMember)
      this.logger.log('Starting dynamic tenant RBAC migration check...');
      const stores = await this.prisma.public.store.findMany({
        include: { owner: true }
      });

      for (const store of stores) {
        const schemaName = `tenant_${store.slug}`;
        this.logger.log(`Checking schema: ${schemaName}`);

        try {
          // Check if TenantRole table exists
          const tableCheck: any[] = await this.prisma.public.$queryRawUnsafe(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE  table_schema = '${schemaName}'
              AND    table_name   = 'TenantRole'
            );
          `);

          const tableExists = tableCheck[0]?.exists;

          if (!tableExists) {
            this.logger.log(`Migrating schema '${schemaName}' for RBAC tables...`);
            
            // Execute SQL migration
            await this.prisma.public.$executeRawUnsafe(`
              SET search_path TO "${schemaName}";
              
              CREATE TABLE IF NOT EXISTS "TenantRole" (
                  "id" TEXT NOT NULL,
                  "name" TEXT NOT NULL,
                  "description" TEXT,
                  "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
                  "accessibleModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
                  "isCustom" BOOLEAN NOT NULL DEFAULT true,
                  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT "TenantRole_pkey" PRIMARY KEY ("id")
              );
              CREATE UNIQUE INDEX IF NOT EXISTS "TenantRole_name_key" ON "TenantRole"("name");

              CREATE TABLE IF NOT EXISTS "TeamMember" (
                  "id" TEXT NOT NULL,
                  "userId" TEXT NOT NULL,
                  "roleId" TEXT,
                  "department" TEXT,
                  "designation" TEXT,
                  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                  "customPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
                  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
              );
              CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_userId_key" ON "TeamMember"("userId");

              ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_roleId_fkey";
              ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            `);

            this.logger.log(`Schema '${schemaName}' RBAC tables created successfully.`);
          }

          // Fetch tenant client
          const tenantPrisma = this.prisma.getTenantClient(schemaName);

          // Seed default roles if empty
          const existingRoles = await tenantPrisma.tenantRole.findMany();
          let seededRoles = existingRoles;
          if (existingRoles.length === 0) {
            this.logger.log(`Seeding default roles in schema '${schemaName}'...`);
            const defaultRoles = [
              { id: crypto.randomUUID(), name: 'COMPANY_OWNER', description: 'Full access to all modules and settings.', isCustom: false, permissions: ['*'], accessibleModules: ['dashboard', 'products', 'orders', 'inventory', 'customers', 'marketing', 'reports', 'settings', 'staff'] },
              { id: crypto.randomUUID(), name: 'ADMINISTRATOR', description: 'Full access excluding billing and ownership.', isCustom: false, permissions: ['products.*', 'orders.*', 'customers.*', 'inventory.*', 'reports.*', 'settings.*', 'team.*'], accessibleModules: ['dashboard', 'products', 'orders', 'inventory', 'customers', 'marketing', 'reports', 'settings', 'staff'] },
              { id: crypto.randomUUID(), name: 'MANAGER', description: 'Access to operations and reporting.', isCustom: false, permissions: ['products.*', 'orders.*', 'customers.*', 'inventory.*', 'reports.*'], accessibleModules: ['dashboard', 'products', 'orders', 'inventory', 'customers', 'reports'] },
              { id: crypto.randomUUID(), name: 'SALES', description: 'Access to products, orders, and customers.', isCustom: false, permissions: ['products.view', 'orders.*', 'customers.*'], accessibleModules: ['dashboard', 'products', 'orders', 'customers'] },
              { id: crypto.randomUUID(), name: 'INVENTORY', description: 'Access to inventory and products.', isCustom: false, permissions: ['products.view', 'products.create', 'products.update', 'inventory.*'], accessibleModules: ['dashboard', 'products', 'inventory'] },
              { id: crypto.randomUUID(), name: 'WAREHOUSE', description: 'Access to stock movements and fulfillment.', isCustom: false, permissions: ['inventory.view', 'inventory.update', 'inventory.adjust', 'orders.view', 'orders.update'], accessibleModules: ['dashboard', 'inventory', 'orders'] },
              { id: crypto.randomUUID(), name: 'SUPPORT', description: 'Access to view orders and manage customers.', isCustom: false, permissions: ['orders.view', 'customers.*', 'tickets.*'], accessibleModules: ['dashboard', 'orders', 'customers'] },
              { id: crypto.randomUUID(), name: 'FINANCE', description: 'Access to billing, invoices, and reports.', isCustom: false, permissions: ['reports.*', 'orders.view', 'settings.view'], accessibleModules: ['dashboard', 'reports', 'settings'] },
              { id: crypto.randomUUID(), name: 'MARKETING', description: 'Access to products and promotions.', isCustom: false, permissions: ['products.*', 'marketing.*', 'customers.view'], accessibleModules: ['dashboard', 'products', 'marketing', 'customers'] },
              { id: crypto.randomUUID(), name: 'READ_ONLY', description: 'View access only across modules.', isCustom: false, permissions: ['products.view', 'orders.view', 'customers.view', 'inventory.view', 'reports.view'], accessibleModules: ['dashboard', 'products', 'orders', 'customers', 'inventory', 'reports'] },
            ];

            await tenantPrisma.tenantRole.createMany({ data: defaultRoles });
            seededRoles = await tenantPrisma.tenantRole.findMany();
            this.logger.log(`Seeded ${defaultRoles.length} roles in schema '${schemaName}'.`);
          }

          // Ensure owner is added as TeamMember
          const owner = store.owner;
          if (owner) {
            const ownerRole = seededRoles.find(r => r.name === 'COMPANY_OWNER');
            if (ownerRole) {
              const existingOwnerMember = await tenantPrisma.teamMember.findUnique({
                where: { userId: owner.id }
              });

              if (!existingOwnerMember) {
                this.logger.log(`Adding owner '${owner.email}' as TeamMember in schema '${schemaName}'...`);
                await tenantPrisma.teamMember.create({
                  data: {
                    id: crypto.randomUUID(),
                    userId: owner.id,
                    roleId: ownerRole.id,
                    department: 'Management',
                    designation: 'Owner',
                    status: 'ACTIVE',
                    customPermissions: [],
                  }
                });
              }
            }
          }

          // Ensure existing staff in UserRegistry are mapped to TeamMembers
          const registries = await this.prisma.public.userRegistry.findMany({
            where: { storeId: store.id }
          });

          for (const registry of registries) {
            // Find global user
            const regUser = await this.prisma.public.user.findUnique({
              where: { email: registry.email }
            });

            if (regUser && regUser.id !== owner?.id) {
              const existingMember = await tenantPrisma.teamMember.findUnique({
                where: { userId: regUser.id }
              });

              if (!existingMember) {
                // Map global roles to a tenant role
                const isManager = regUser.roles.includes('STORE_MANAGER');
                const isEmployee = regUser.roles.includes('STORE_EMPLOYEE');
                
                let targetRoleName = 'READ_ONLY';
                if (isManager) targetRoleName = 'MANAGER';
                else if (isEmployee) targetRoleName = 'INVENTORY'; // default to inventory for employee/staff to make them functional

                const targetRole = seededRoles.find(r => r.name === targetRoleName) || seededRoles[seededRoles.length - 1];

                this.logger.log(`Adding staff '${registry.email}' as TeamMember (Role: ${targetRole.name}) in schema '${schemaName}'...`);
                await tenantPrisma.teamMember.create({
                  data: {
                    id: crypto.randomUUID(),
                    userId: regUser.id,
                    roleId: targetRole.id,
                    department: 'Operations',
                    designation: 'Staff',
                    status: 'ACTIVE',
                    customPermissions: [],
                  }
                });
              }
            }
          }

        } catch (schemaErr: any) {
          this.logger.error(`Failed to verify/migrate schema '${schemaName}': ${schemaErr.message}`);
        }
      }

      this.logger.log('Dynamic tenant RBAC migration check completed.');

    } catch (err: any) {
      this.logger.error(`Bootstrap check error: ${err?.message || err}`);
    }
  }
}
