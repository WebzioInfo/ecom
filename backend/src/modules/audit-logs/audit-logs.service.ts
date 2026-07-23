import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    storeId?: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.client.auditLog.create({
      data: {
        ...params,
        storeId: params.storeId || null,
        changes: (params.changes || {}) as Prisma.InputJsonValue,
      }
    });
  }

  async findByStore(storeId: string, limit = 50) {
    return this.prisma.client.auditLog.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true, roles: true } }
      }
    });
  }

  async findGlobal(limit = 100) {
    return this.prisma.client.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true, roles: true } },
        store: { select: { name: true, slug: true } }
      }
    });
  }
}
