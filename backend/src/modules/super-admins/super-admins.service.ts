import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, SuperAdmin } from '@prisma/public-client';

@Injectable()
export class SuperAdminsService {
  constructor(private prisma: PrismaService) {}

  async create(createData: Prisma.SuperAdminCreateInput): Promise<SuperAdmin> {
    return this.prisma.client.superAdmin.create({ data: createData });
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    return this.prisma.client.superAdmin.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<SuperAdmin | null> {
    return this.prisma.client.superAdmin.findUnique({ where: { id } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.client.superAdmin.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async recordLoginHistory(id: string, ip: string, device: string): Promise<void> {
    const admin = await this.prisma.client.superAdmin.findUnique({ where: { id } });
    if (!admin) return;

    let loginHistory = (admin.loginHistory as any[]) || [];
    loginHistory.push({ ip, device, createdAt: new Date() });
    
    // keep last 50 entries
    if (loginHistory.length > 50) {
      loginHistory = loginHistory.slice(-50);
    }

    await this.prisma.client.superAdmin.update({
      where: { id },
      data: {
        loginHistory,
        lastLogin: new Date(),
      }
    });
  }

  async count(): Promise<number> {
    return this.prisma.client.superAdmin.count();
  }
}
