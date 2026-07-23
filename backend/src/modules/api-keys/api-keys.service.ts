import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ApiKey } from '@prisma/public-client';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApiKeyDto) {
    const rawKey = `wbx_live_${crypto.randomBytes(16).toString('hex')}`;
    const rawSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto
      .createHash('sha256')
      .update(rawSecret)
      .digest('hex');

    const apiKey = await this.prisma.client.apiKey.create({
      data: {
        storeId: dto.storeId,
        name: dto.name,
        key: rawKey,
        secretHash,
        webhookSecret: rawSecret,
        permissions: dto.permissions || ['read:products', 'write:orders'],
        allowedOrigins: dto.allowedOrigins || ['*'],
        rateLimitPerMinute: dto.rateLimitPerMinute || 1000,
      }
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      apiKey: rawKey,
      secretKey: rawSecret,
      webhookSecret: rawSecret,
      permissions: apiKey.permissions,
      createdAt: apiKey.createdAt,
    };
  }

  async findByStore(storeId: string) {
    const keys = await this.prisma.client.apiKey.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });
    // Remove secretHash before returning
    return keys.map((k: any) => { const { secretHash, ...rest } = k; return rest; });
  }

  async findByKey(key: string) {
    return this.prisma.client.apiKey.findFirst({
      where: { key, isActive: true }
    });
  }

  async update(id: string, dto: UpdateApiKeyDto) {
    try {
      const key = await this.prisma.client.apiKey.update({
        where: { id },
        data: dto as any
      });
      const { secretHash, ...rest } = key;
      return rest;
    } catch {
      throw new NotFoundException(`API key #${id} not found`);
    }
  }

  async revoke(id: string) {
    try {
      await this.prisma.client.apiKey.update({
        where: { id },
        data: { isActive: false }
      });
      return { message: 'API key revoked successfully' };
    } catch {
      throw new NotFoundException(`API key #${id} not found`);
    }
  }

  async regenerateSecret(id: string) {
    const newSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto
      .createHash('sha256')
      .update(newSecret)
      .digest('hex');
      
    try {
      const key = await this.prisma.client.apiKey.update({
        where: { id },
        data: { secretHash, webhookSecret: newSecret }
      });
      return {
        id: key.id,
        webhookSecret: newSecret,
        message: 'Secret key regenerated successfully',
      };
    } catch {
      throw new NotFoundException(`API key #${id} not found`);
    }
  }
}
