import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService, private usersService: UsersService) {}

  async listMembers(tenantId: string) {
    const tenantPrisma = this.prisma.getTenantClient(tenantId);
    const members = await tenantPrisma.teamMember.findMany({
      include: { role: true },
    });
    
    // Enrich with global user details
    const userIds = members.map(m => m.userId);
    const globalUsers = await this.prisma.public.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    return members.map(member => {
      const gUser = globalUsers.find(u => u.id === member.userId);
      return {
        ...member,
        name: gUser?.name,
        email: gUser?.email,
      };
    });
  }

  async listRoles(tenantId: string) {
    const tenantPrisma = this.prisma.getTenantClient(tenantId);
    return tenantPrisma.tenantRole.findMany();
  }

  async createMember(tenantId: string, storeId: string, dto: any) {
    const { email, name, roleId, department, designation } = dto;
    
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // Create user globally with a random password if they don't exist
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await this.usersService.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
      });
    }

    // Check if already in tenant
    const tenantPrisma = this.prisma.getTenantClient(tenantId);
    const existing = await tenantPrisma.teamMember.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this team.');
    }

    // Create Registry
    const registryExists = await this.prisma.public.userRegistry.findFirst({
      where: { email, storeId },
    });
    if (!registryExists) {
      await this.prisma.public.userRegistry.create({
        data: { email, storeId, schema: tenantId },
      });
    }

    // Add to TeamMember
    const member = await tenantPrisma.teamMember.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        roleId,
        department,
        designation,
      },
      include: { role: true },
    });

    return { ...member, name: user.name, email: user.email };
  }

  async updateMember(tenantId: string, id: string, dto: any) {
    const tenantPrisma = this.prisma.getTenantClient(tenantId);
    return tenantPrisma.teamMember.update({
      where: { id },
      data: {
        roleId: dto.roleId,
        department: dto.department,
        designation: dto.designation,
        customPermissions: dto.customPermissions,
        status: dto.status,
      },
      include: { role: true },
    });
  }

  async removeMember(tenantId: string, id: string) {
    const tenantPrisma = this.prisma.getTenantClient(tenantId);
    const member = await tenantPrisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    
    await tenantPrisma.teamMember.delete({ where: { id } });

    // Clean up registry so they can't login to this store anymore
    const user = await this.prisma.public.user.findUnique({ where: { id: member.userId } });
    if (user) {
       await this.prisma.public.userRegistry.deleteMany({
         where: { email: user.email, schema: tenantId }
       });
    }

    return { message: 'Member removed successfully' };
  }
}
