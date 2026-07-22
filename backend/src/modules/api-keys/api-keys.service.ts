import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async create(dto: CreateApiKeyDto) {
    const rawKey = `wbx_live_${crypto.randomBytes(16).toString('hex')}`;
    const rawSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto
      .createHash('sha256')
      .update(rawSecret)
      .digest('hex');

    const apiKey = new this.apiKeyModel({
      storeId: new Types.ObjectId(dto.storeId),
      name: dto.name,
      key: rawKey,
      secretHash,
      webhookSecret: rawSecret,
      permissions: dto.permissions || ['read:products', 'write:orders'],
      allowedOrigins: dto.allowedOrigins || ['*'],
      rateLimitPerMinute: dto.rateLimitPerMinute || 1000,
    });

    const saved = await apiKey.save();

    return {
      id: saved._id,
      name: saved.name,
      apiKey: rawKey,
      secretKey: rawSecret,
      webhookSecret: rawSecret,
      permissions: saved.permissions,
      createdAt: (saved as unknown as { createdAt?: Date }).createdAt,
    };
  }

  async findByStore(storeId: string) {
    return this.apiKeyModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .select('-secretHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByKey(key: string) {
    return this.apiKeyModel.findOne({ key, isActive: true }).exec();
  }

  async update(id: string, dto: UpdateApiKeyDto) {
    const key = await this.apiKeyModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .select('-secretHash')
      .exec();
    if (!key) {
      throw new NotFoundException(`API key #${id} not found`);
    }
    return key;
  }

  async revoke(id: string) {
    const key = await this.apiKeyModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!key) {
      throw new NotFoundException(`API key #${id} not found`);
    }
    return { message: 'API key revoked successfully' };
  }

  async regenerateSecret(id: string) {
    const newSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = crypto
      .createHash('sha256')
      .update(newSecret)
      .digest('hex');
    const key = await this.apiKeyModel
      .findByIdAndUpdate(
        id,
        { secretHash, webhookSecret: newSecret },
        { new: true },
      )
      .exec();
    if (!key) {
      throw new NotFoundException(`API key #${id} not found`);
    }
    return {
      id: key._id,
      webhookSecret: newSecret,
      message: 'Secret key regenerated successfully',
    };
  }
}
