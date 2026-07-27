import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Customer } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: Prisma.CustomerUncheckedCreateInput): Promise<Customer> {
    return this.prisma.client.customer.create({ data: dto });
  }

  async findByStore(
    storeId: string,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const { search, page = 1, limit = 20 } = query || {};
    const where: any = {};
    if (storeId && storeId !== 'tenant-context') {
      where.storeId = storeId;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.client.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.customer.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.client.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer #${id} not found`);
    return customer;
  }

  async update(id: string, dto: Prisma.CustomerUpdateInput): Promise<Customer> {
    try {
      return await this.prisma.client.customer.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`Customer #${id} not found`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.client.customer.delete({ where: { id } });
      return { message: `Customer #${id} deleted successfully` };
    } catch {
      throw new NotFoundException(`Customer #${id} not found`);
    }
  }
}
