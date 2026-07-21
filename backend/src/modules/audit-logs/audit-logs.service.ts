import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: {
    storeId?: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const auditLog = new this.auditLogModel({
      ...params,
      storeId: params.storeId ? new Types.ObjectId(params.storeId) : null,
      userId: new Types.ObjectId(params.userId),
    });
    return auditLog.save();
  }

  async findByStore(storeId: string, limit = 50) {
    return this.auditLogModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .populate('userId', 'name email roles')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findGlobal(limit = 100) {
    return this.auditLogModel
      .find()
      .populate('userId', 'name email roles')
      .populate('storeId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
