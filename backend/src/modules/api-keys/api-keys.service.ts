import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateApiKeyDto, userId?: string) {
    const rawKey = `pk_live_${crypto.randomBytes(16).toString('hex')}`;
    const rawSecret = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto.createHash('sha256').update(rawSecret).digest('hex');

    const apiKey = await this.prisma.public.apiKey.create({
      data: {
        storeId: dto.storeId,
        name: dto.name || 'Store API Key',
        key: rawKey,
        secretHash,
        webhookSecret: rawSecret,
        permissions: dto.permissions || ['*'],
      },
    });

    this.eventService.emit('apikey.created' as any, { storeId: dto.storeId, apiKeyId: apiKey.id, publicKey: rawKey });

    return {
      id: apiKey.id,
      storeId: apiKey.storeId,
      name: apiKey.name,
      publicKey: rawKey,
      secretKey: rawSecret,
      createdAt: apiKey.createdAt,
    };
  }

  async rotateKeys(storeId: string, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    // Deactivate / Remove old keys
    await this.prisma.public.apiKey.deleteMany({ where: { storeId } });

    // Generate new key pair
    const newPublicKey = `pk_live_${crypto.randomBytes(16).toString('hex')}`;
    const newSecretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto.createHash('sha256').update(newSecretKey).digest('hex');

    const apiKey = await this.prisma.public.apiKey.create({
      data: {
        storeId,
        name: `${store.name} Rotated Key`,
        key: newPublicKey,
        secretHash,
        webhookSecret: newSecretKey,
        permissions: ['*'],
      },
    });

    this.eventService.emit('apikey.rotated' as any, { storeId, publicKey: newPublicKey });

    return {
      id: apiKey.id,
      storeId,
      publicKey: newPublicKey,
      secretKey: newSecretKey,
      message: 'API Key pair successfully rotated.',
    };
  }

  async findByStore(storeId: string) {
    return this.prisma.public.apiKey.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeId: true,
        name: true,
        key: true,
        permissions: true,
        createdAt: true,
      },
    });
  }

  async findByKey(key: string) {
    return this.prisma.public.apiKey.findFirst({
      where: { key },
    });
  }

  async update(id: string, dto: UpdateApiKeyDto) {
    try {
      return await this.prisma.public.apiKey.update({
        where: { id },
        data: dto as any,
      });
    } catch {
      throw new NotFoundException(`API Key #${id} not found.`);
    }
  }

  async revoke(id: string, userId?: string) {
    const key = await this.prisma.public.apiKey.findUnique({ where: { id } });
    if (!key) throw new NotFoundException(`API Key #${id} not found.`);

    await this.prisma.public.apiKey.delete({ where: { id } });

    return { message: 'API Key revoked successfully.' };
  }
}
