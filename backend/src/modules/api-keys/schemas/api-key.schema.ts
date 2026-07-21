import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  key: string; // Public API Key (e.g. wbx_live_...)

  @Prop({ required: true })
  secretHash: string; // Secret Key Hash

  @Prop()
  webhookSecret?: string;

  @Prop({ type: [String], default: ['read:products', 'write:orders'] })
  permissions: string[];

  @Prop({ type: [String], default: ['*'] })
  allowedOrigins: string[];

  @Prop({ default: 1000 })
  rateLimitPerMinute: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt?: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
