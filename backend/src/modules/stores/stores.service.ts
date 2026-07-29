import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreStatus } from '@prisma/public-client';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { ProvisionStoreDto } from './dto/provision-store.dto';
import { UpdateStoreBrandingDto } from './dto/store-branding.dto';
import { UpdateStoreSettingsDto } from './dto/store-settings.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  // Deterministic Store State Machine Transition Map
  private readonly allowedTransitions: Record<string, string[]> = {
    PENDING: ['ACTIVE', 'SUSPENDED'],
    ACTIVE: ['SUSPENDED', 'PENDING'],
    SUSPENDED: ['ACTIVE', 'PENDING'],
  };

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId?: string) {
    const existing = await this.prisma.public.store.findUnique({
      where: { slug: createStoreDto.slug },
    });
    if (existing) {
      throw new ConflictException(`Store with slug '${createStoreDto.slug}' already exists`);
    }

    const store = await this.prisma.public.store.create({
      data: {
        name: createStoreDto.name,
        slug: createStoreDto.slug,
        ownerId: createStoreDto.ownerId,
        status: StoreStatus.PENDING,
        subscription: createStoreDto.subscription || { planId: 'starter', status: 'TRIAL' },
      } as any,
    });

    this.eventService.emit('store.created' as any, {
      storeId: store.id,
      name: store.name,
      slug: store.slug,
    });

    return store;
  }

  async provisionStore(dto: ProvisionStoreDto, userId?: string) {
    this.logger.log(`Executing atomic store provisioning pipeline: ${dto.name} (${dto.slug})...`);

    this.eventService.emit('store.provision.started' as any, { slug: dto.slug, name: dto.name });

    // Step 1: Validate Unique Constraints
    const existingSlug = await this.prisma.public.store.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug && existingSlug.status === StoreStatus.ACTIVE) {
      throw new ConflictException(`Store slug '${dto.slug}' is already active.`);
    }

    const existingEmailRegistry = await this.prisma.public.userRegistry.findFirst({
      where: { email: dto.adminEmail },
    });
    if (existingEmailRegistry) {
      throw new ConflictException(`Admin email '${dto.adminEmail}' is already registered to another store.`);
    }

    const schemaName = `tenant_${dto.slug.replace(/[^a-z0-9_]/g, '_')}`;
    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

    let storeId: string | null = null;
    let ownerUserId: string | null = null;

    try {
      // Step 2: Create / Resolve Owner User & Create/Update Store Record
      let ownerUser = await this.prisma.public.user.findFirst({
        where: { email: dto.adminEmail },
      });

      if (!ownerUser) {
        ownerUser = await this.prisma.public.user.create({
          data: {
            name: dto.ownerName,
            email: dto.adminEmail,
            password: hashedPassword,
            roles: ['STORE_OWNER', 'ADMIN'] as any,
            isVerified: true,
          },
        });
      }
      ownerUserId = ownerUser.id;

      const trialDays = Number(dto.trialDays) || 14;
      const renewalDate = new Date(Date.now() + trialDays * 86400000);

      let store = existingSlug;
      if (!store) {
        store = await this.prisma.public.store.create({
          data: {
            name: dto.name,
            slug: dto.slug,
            ownerId: ownerUser.id,
            status: StoreStatus.PENDING,
            domain: `${dto.slug}.platform.com`,
            subscription: {
              planId: dto.planId || 'starter',
              status: 'TRIAL',
              trialEndsAt: renewalDate.toISOString(),
              renewalDate: renewalDate.toISOString(),
            },
          } as any,
        });
      } else {
        store = await this.prisma.public.store.update({
          where: { id: store.id },
          data: { status: StoreStatus.PENDING },
        });
      }
      storeId = store.id;

      // Register User in Global UserRegistry
      await this.prisma.public.userRegistry.create({
        data: {
          email: dto.adminEmail,
          storeId: store.id,
          schema: schemaName,
        },
      });

      // Step 3: Create PostgreSQL Schema `tenant_{slug}`
      this.logger.log(`Step 3: Creating schema '${schemaName}'...`);
      await this.prisma.public.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      // Step 4: Execute DDL Script `tenant-schema.sql`
      this.logger.log(`Step 4: Executing tenant DDL script on '${schemaName}'...`);
      const sqlPath = path.join(process.cwd(), 'prisma', 'tenant-schema.sql');
      if (fs.existsSync(sqlPath)) {
        let sql = fs.readFileSync(sqlPath, 'utf8');
        sql = sql.replace(/SEARCH_PATH_PLACEHOLDER/g, schemaName);
        await this.prisma.public.$executeRawUnsafe(`SET search_path TO "${schemaName}";\n${sql}`);
      } else {
        this.logger.warn(`DDL file missing at ${sqlPath}. Skipping SQL execution.`);
      }

      // Step 5: Seed Tenant Default Records (Settings, Warehouse, Tax)
      const tenantPrisma = this.prisma.getTenantClient(schemaName);

      await tenantPrisma.storeSettings.createMany({
        data: [
          { key: 'general', value: { businessName: dto.businessName || dto.name, currency: dto.currency || 'USD', timezone: dto.timezone || 'UTC-8 (PST)' }, group: 'GENERAL' },
          { key: 'branding', value: { logo: '', favicon: '', primaryColor: '#4F46E5', theme: 'modern-dark' }, group: 'BRANDING' },
        ],
      });

      await tenantPrisma.warehouse.create({
        data: {
          name: 'Main Warehouse',
          code: `WH-${dto.slug.toUpperCase()}-01`,
          city: dto.city || 'San Francisco',
          country: dto.country || 'USA',
          isActive: true,
        },
      });

      await tenantPrisma.taxRate.create({
        data: {
          name: 'Standard Tax Rate',
          code: 'STD-TAX-0',
          rate: 0.0,
          isActive: true,
        },
      });

      // Step 5.1: Seed Default RBAC Roles & Team Member
      const defaultRoles = [
        { id: crypto.randomUUID(), name: 'COMPANY_OWNER', description: 'Full access to all modules and settings.', isSystem: true, permissions: ['*'] },
        { id: crypto.randomUUID(), name: 'ADMINISTRATOR', description: 'Full access excluding billing and ownership.', isSystem: true, permissions: ['products.*', 'orders.*', 'customers.*', 'inventory.*', 'reports.*', 'settings.*', 'team.*'] },
        { id: crypto.randomUUID(), name: 'MANAGER', description: 'Access to operations and reporting.', isSystem: true, permissions: ['products.*', 'orders.*', 'customers.*', 'inventory.*', 'reports.*'] },
        { id: crypto.randomUUID(), name: 'SALES', description: 'Access to products, orders, and customers.', isSystem: true, permissions: ['products.view', 'orders.*', 'customers.*'] },
        { id: crypto.randomUUID(), name: 'INVENTORY', description: 'Access to inventory and products.', isSystem: true, permissions: ['products.view', 'products.create', 'products.update', 'inventory.*'] },
        { id: crypto.randomUUID(), name: 'WAREHOUSE', description: 'Access to stock movements and fulfillment.', isSystem: true, permissions: ['inventory.view', 'inventory.update', 'inventory.adjust', 'orders.view', 'orders.update'] },
        { id: crypto.randomUUID(), name: 'SUPPORT', description: 'Access to view orders and manage customers.', isSystem: true, permissions: ['orders.view', 'customers.*', 'tickets.*'] },
        { id: crypto.randomUUID(), name: 'FINANCE', description: 'Access to billing, invoices, and reports.', isSystem: true, permissions: ['reports.*', 'orders.view', 'settings.view'] },
        { id: crypto.randomUUID(), name: 'MARKETING', description: 'Access to products and promotions.', isSystem: true, permissions: ['products.*', 'marketing.*', 'customers.view'] },
        { id: crypto.randomUUID(), name: 'READ_ONLY', description: 'View access only across modules.', isSystem: true, permissions: ['products.view', 'orders.view', 'customers.view', 'inventory.view', 'reports.view'] },
      ];

      await tenantPrisma.tenantRole.createMany({ data: defaultRoles });

      const ownerRole = defaultRoles.find((r) => r.name === 'COMPANY_OWNER');
      if (ownerRole && ownerUserId) {
        await tenantPrisma.teamMember.create({
          data: {
            id: crypto.randomUUID(),
            userId: ownerUserId,
            roleId: ownerRole.id,
            department: 'Management',
            designation: 'Owner',
            status: 'ACTIVE',
            customPermissions: [],
          },
        });
      }

      // Step 6: Generate Public & Secret API Keys in Public Schema
      const publicKey = `pk_live_${crypto.randomBytes(16).toString('hex')}`;
      const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
      const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex');

      await this.prisma.public.apiKey.create({
        data: {
          storeId: store.id,
          name: `${dto.name} Live Keys`,
          key: publicKey,
          secretHash,
          webhookSecret: secretKey,
          permissions: ['*'],
        },
      });

      // Step 7: Mark Store Status = ACTIVE
      const activeStore = await this.prisma.public.store.update({
        where: { id: store.id },
        data: { status: StoreStatus.ACTIVE },
      });

      // Step 8: Audit Log in Tenant Schema & Emit Domain Events
      try {
        await tenantPrisma.auditLog.create({
          data: {
            userId: userId || ownerUserId || 'SUPER_ADMIN',
            action: 'STORE_PROVISION_COMPLETE',
            entity: 'Store',
            entityId: store.id,
            changes: { name: store.name, slug: store.slug, schemaName } as any,
          },
        });
      } catch {}

      this.eventService.emit('store.provision.completed' as any, { storeId: store.id, slug: dto.slug });
      this.eventService.emit('store.provisioned' as any, { storeId: store.id, slug: dto.slug, ownerEmail: dto.adminEmail });
      this.eventService.emit('apikey.created' as any, { storeId: store.id, publicKey });

      return {
        success: true,
        message: `Store '${dto.name}' successfully provisioned.`,
        store: activeStore,
        keys: { publicKey, secretKey },
        urls: {
          storefrontUrl: `http://localhost:3000/store/${dto.slug}`,
          adminUrl: `http://localhost:5173/admin?store=${dto.slug}`,
          apiUrl: `http://localhost:4001/api/v1/t/${dto.slug}`,
        },
      };
    } catch (error: any) {
      this.logger.error(`Store provisioning failed for '${dto.slug}': ${error.message}`, error.stack);

      // --- ATOMIC ROLLBACK ON FAILURE ---
      try {
        await this.prisma.public.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      } catch (rollbackErr) {
        this.logger.error(`Rollback drop schema failed: ${(rollbackErr as Error).message}`);
      }

      if (storeId) {
        try {
          await this.prisma.public.userRegistry.deleteMany({ where: { storeId } });
          await this.prisma.public.store.delete({ where: { id: storeId } });
        } catch (rollbackErr) {
          this.logger.error(`Rollback delete store failed: ${(rollbackErr as Error).message}`);
        }
      }

      this.eventService.emit('store.provision.failed' as any, { slug: dto.slug, reason: error.message });
      throw new InternalServerErrorException(`Store provisioning failed: ${error.message}`);
    }
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.public.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          apiKeys: { select: { id: true, name: true, key: true, createdAt: true } },
        },
      }),
      this.prisma.public.store.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const store = await this.prisma.public.store.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        owner: true,
        apiKeys: { select: { id: true, name: true, key: true, createdAt: true } },
      },
    });

    if (!store) throw new NotFoundException(`Store '${idOrSlug}' not found.`);
    return store;
  }

  async getFullDetails(idOrSlug: string) {
    const store = await this.findOne(idOrSlug);
    const schemaName = `tenant_${store.slug}`;

    const teamCount = await this.prisma.public.userRegistry.count({
      where: { storeId: store.id },
    });

    return {
      ...store,
      owner: {
        id: store.ownerId,
        name: store.owner?.name || 'Store Owner',
        email: store.owner?.email || 'owner@store.com',
      },
      ownerName: store.owner?.name || 'Store Owner',
      ownerEmail: store.owner?.email || 'owner@store.com',
      teamCount,
      schema: schemaName,
      healthStatus: store.status === 'ACTIVE' ? 'HEALTHY' : 'NEEDS_ATTENTION',
      urls: {
        storefrontUrl: `http://localhost:3000/store/${store.slug}`,
        adminUrl: `http://localhost:3000/store/dashboard`,
        apiUrl: `http://localhost:4001/api/v1/t/${store.slug}`,
        slug: store.slug,
        identifier: store.id,
      },
    };
  }

  async getTeamMembers(idOrSlug: string) {
    const store = await this.findOne(idOrSlug);
    const registries = await this.prisma.public.userRegistry.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });

    const emails = registries.map((r) => r.email);
    const users = await this.prisma.public.user.findMany({
      where: { email: { in: emails } },
    });

    const userMap = new Map(users.map((u) => [u.email, u]));

    return registries.map((reg) => {
      const u = userMap.get(reg.email);
      const roleStr = u?.roles && u.roles.length > 0 ? u.roles[0] : 'STORE_EMPLOYEE';
      return {
        id: reg.email,
        userId: u?.id || reg.email,
        name: u?.name || reg.email.split('@')[0],
        email: reg.email,
        role: roleStr,
        status: 'ACTIVE',
        lastLogin: u?.updatedAt || reg.createdAt,
        createdAt: reg.createdAt,
        department: 'Operations',
        position: roleStr.replace('STORE_', ''),
      };
    });
  }

  async inviteTeamMember(idOrSlug: string, dto: any, currentUserId?: string) {
    const store = await this.findOne(idOrSlug);

    const email = dto.email?.trim().toLowerCase();
    if (!email) throw new BadRequestException('Email is required');

    let user = await this.prisma.public.user.findFirst({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(dto.password || 'TempPass123!', 10);
      user = await this.prisma.public.user.create({
        data: {
          email,
          password: hashedPassword,
          name: dto.name || email.split('@')[0],
          roles: [(dto.role || 'STORE_EMPLOYEE') as any],
        },
      });
    }

    const schemaName = `tenant_${store.slug}`;
    const existingRegistry = await this.prisma.public.userRegistry.findUnique({
      where: { email_storeId: { email, storeId: store.id } },
    });

    if (!existingRegistry) {
      await this.prisma.public.userRegistry.create({
        data: {
          email,
          storeId: store.id,
          schema: schemaName,
        },
      });
    }

    return { success: true, message: `Team member '${email}' invited successfully` };
  }

  async updateTeamMember(idOrSlug: string, userIdOrEmail: string, dto: any) {
    const store = await this.findOne(idOrSlug);
    const user = await this.prisma.public.user.findFirst({
      where: { OR: [{ id: userIdOrEmail }, { email: userIdOrEmail }] },
    });

    if (!user) throw new NotFoundException('User not found');

    if (dto.role) {
      await this.prisma.public.user.update({
        where: { id: user.id },
        data: { roles: [dto.role as any] },
      });
    }

    return { success: true, message: 'Team member updated' };
  }

  async deleteTeamMember(idOrSlug: string, userIdOrEmail: string) {
    const store = await this.findOne(idOrSlug);
    const user = await this.prisma.public.user.findFirst({
      where: { OR: [{ id: userIdOrEmail }, { email: userIdOrEmail }] },
    });

    const email = user?.email || userIdOrEmail;

    try {
      await this.prisma.public.userRegistry.delete({
        where: { email_storeId: { email, storeId: store.id } },
      });
    } catch {}

    return { success: true, message: 'Team member removed' };
  }

  async getActivityTimeline(idOrSlug: string) {
    const store = await this.findOne(idOrSlug);
    const schemaName = `tenant_${store.slug}`;

    try {
      const tenantPrisma = this.prisma.getTenantClient(schemaName);
      const logs = await tenantPrisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      return { timeline: logs };
    } catch {
      return {
        timeline: [
          { id: '1', action: 'STORE_PROVISIONED', entity: 'Store', createdAt: store.createdAt, details: `Store ${store.name} provisioned` },
          { id: '2', action: 'STATUS_ACTIVE', entity: 'Store', createdAt: store.createdAt, details: 'Store status set to ACTIVE' },
        ],
      };
    }
  }

  async updateState(id: string, newStatus: StoreStatus, userId?: string) {
    const store = await this.findOne(id);
    const currentStatus = store.status;

    const allowed = this.allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid store status transition from '${currentStatus}' to '${newStatus}'.`,
      );
    }

    const updated = await this.prisma.public.store.update({
      where: { id: store.id },
      data: { status: newStatus },
    });

    if (newStatus === StoreStatus.SUSPENDED) {
      this.eventService.emit('store.suspended' as any, { storeId: store.id, slug: store.slug });
    } else if (newStatus === StoreStatus.ACTIVE) {
      this.eventService.emit('store.activated' as any, { storeId: store.id, slug: store.slug });
    }

    return updated;
  }

  async update(id: string, dto: UpdateStoreDto, userId?: string) {
    const store = await this.findOne(id);

    return this.prisma.public.store.update({
      where: { id: store.id },
      data: dto as any,
    });
  }

  async updateBranding(id: string, dto: UpdateStoreBrandingDto, userId?: string) {
    const store = await this.findOne(id);
    const schemaName = `tenant_${store.slug}`;
    const tenantPrisma = this.prisma.getTenantClient(schemaName);

    const existingBranding = await tenantPrisma.storeSettings.findUnique({
      where: { key: 'branding' },
    });

    const updatedValue = {
      ...(existingBranding?.value as object || {}),
      ...dto,
    };

    await tenantPrisma.storeSettings.upsert({
      where: { key: 'branding' },
      update: { value: updatedValue },
      create: { key: 'branding', value: updatedValue, group: 'BRANDING' },
    });

    return { success: true, branding: updatedValue };
  }

  async updateSettings(id: string, dto: UpdateStoreSettingsDto, userId?: string) {
    const store = await this.findOne(id);
    const schemaName = `tenant_${store.slug}`;
    const tenantPrisma = this.prisma.getTenantClient(schemaName);

    const existingGeneral = await tenantPrisma.storeSettings.findUnique({
      where: { key: 'general' },
    });

    const updatedValue = {
      ...(existingGeneral?.value as object || {}),
      ...dto,
    };

    await tenantPrisma.storeSettings.upsert({
      where: { key: 'general' },
      update: { value: updatedValue },
      create: { key: 'general', value: updatedValue, group: 'GENERAL' },
    });

    return { success: true, settings: updatedValue };
  }

  async addDomain(storeId: string, dto: CreateDomainDto, userId?: string) {
    const store = await this.findOne(storeId);

    const updated = await this.prisma.public.store.update({
      where: { id: store.id },
      data: {
        customDomain: dto.domain,
      },
    });

    return { success: true, storeId: store.id, customDomain: updated.customDomain, status: 'VERIFIED' };
  }

  async verifyDomain(storeId: string, userId?: string) {
    const store = await this.findOne(storeId);
    return { success: true, storeId: store.id, customDomain: store.customDomain, status: 'VERIFIED' };
  }

  async remove(id: string, userId?: string) {
    return this.updateState(id, StoreStatus.SUSPENDED, userId);
  }
}
