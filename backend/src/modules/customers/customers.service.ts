import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { CreateCustomerAddressDto } from './dto/create-address.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { AddressType } from '@prisma/client';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateCustomerDto, userId?: string) {
    const existing = await this.prisma.tenant.customer.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(`Customer with email '${dto.email}' already exists.`);
    }

    const customer = await this.prisma.tenant.customer.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        notes: dto.notes,
        tags: dto.tags || [],
        isActive: dto.isActive ?? true,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CUSTOMER_CREATE',
            entity: 'Customer',
            entityId: customer.id,
            changes: { email: customer.email, name: `${customer.firstName} ${customer.lastName}` },
          },
        });
      } catch {}
    }

    this.eventService.emit('customer.created' as any, {
      customerId: customer.id,
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
    });

    return customer;
  }

  async findAll(query: ListCustomersDto) {
    const { search, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          addresses: true,
          _count: { select: { orders: true, carts: true, wishlist: true } },
        },
      }),
      this.prisma.tenant.customer.count({ where }),
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

  async findOne(id: string) {
    const customer = await this.prisma.tenant.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
        wishlist: { include: { product: true, variant: true } },
        _count: { select: { orders: true } },
      },
    });

    if (!customer || customer.isDeleted) {
      throw new NotFoundException(`Customer #${id} not found.`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, userId?: string) {
    const customer = await this.findOne(id);

    if (dto.email && dto.email !== customer.email) {
      const existingEmail = await this.prisma.tenant.customer.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(`Customer email '${dto.email}' already exists.`);
      }
    }

    const updated = await this.prisma.tenant.customer.update({
      where: { id },
      data: dto as any,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CUSTOMER_UPDATE',
            entity: 'Customer',
            entityId: id,
            changes: dto as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('customer.updated' as any, {
      customerId: id,
      email: updated.email,
    });

    return updated;
  }

  async softDelete(id: string, userId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.tenant.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CUSTOMER_DELETE',
            entity: 'Customer',
            entityId: id,
            changes: { isDeleted: true },
          },
        });
      } catch {}
    }

    return { message: `Customer #${id} soft deleted successfully.` };
  }

  async restore(id: string, userId?: string) {
    const customer = await this.prisma.tenant.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer #${id} not found.`);

    const restored = await this.prisma.tenant.customer.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null, isActive: true },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CUSTOMER_RESTORE',
            entity: 'Customer',
            entityId: id,
            changes: { isDeleted: false },
          },
        });
      } catch {}
    }

    return restored;
  }

  // --- Customer Address Book Management ---

  async addAddress(customerId: string, dto: CreateCustomerAddressDto) {
    await this.findOne(customerId);
    const addressType = dto.type || AddressType.SHIPPING;

    // Single Default Address Rule: If isDefault = true, unset previous default for this customer & type
    if (dto.isDefault) {
      await this.prisma.tenant.customerAddress.updateMany({
        where: { customerId, type: addressType },
        data: { isDefault: false },
      });
    }

    return this.prisma.tenant.customerAddress.create({
      data: {
        customerId,
        type: addressType,
        firstName: dto.firstName,
        lastName: dto.lastName,
        company: dto.company,
        address1: dto.address1,
        address2: dto.address2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateAddress(addressId: string, dto: Partial<CreateCustomerAddressDto>) {
    const address = await this.prisma.tenant.customerAddress.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException(`Address #${addressId} not found.`);

    const addressType = dto.type || address.type;

    if (dto.isDefault) {
      await this.prisma.tenant.customerAddress.updateMany({
        where: { customerId: address.customerId, type: addressType, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.tenant.customerAddress.update({
      where: { id: addressId },
      data: dto as any,
    });
  }

  async deleteAddress(addressId: string) {
    const address = await this.prisma.tenant.customerAddress.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException(`Address #${addressId} not found.`);

    await this.prisma.tenant.customerAddress.delete({ where: { id: addressId } });
    return { message: `Address #${addressId} deleted successfully.` };
  }
}
