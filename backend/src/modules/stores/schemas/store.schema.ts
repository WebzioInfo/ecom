import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreDocument = Store & Document;

export enum StoreStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Schema({ _id: false })
export class StoreBranding {
  @Prop({ default: '#4f46e5' })
  primaryColor: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: 'dark' })
  theme: string;
}

@Schema({ _id: false })
export class StoreSettings {
  @Prop({ default: 18 })
  taxPercentage: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ type: Object, default: {} })
  paymentGateways: {
    stripe?: { enabled: boolean; publicKey?: string; secretKey?: string };
    razorpay?: { enabled: boolean; keyId?: string; keySecret?: string };
    paypal?: { enabled: boolean; clientId?: string; clientSecret?: string };
  };

  @Prop({ type: Object, default: {} })
  shippingProviders: {
    shiprocket?: { enabled: boolean; apiKey?: string };
    delhivery?: { enabled: boolean; token?: string };
  };
}

@Schema({ _id: false })
export class SubscriptionInfo {
  @Prop({ type: Types.ObjectId, ref: 'Plan' })
  planId?: Types.ObjectId;

  @Prop({ enum: ['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL'], default: 'TRIAL' })
  status: string;

  @Prop()
  renewalDate?: Date;

  @Prop()
  trialEndDate?: Date;
}

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop()
  domain?: string;

  @Prop()
  customDomain?: string;

  @Prop({ type: String, enum: StoreStatus, default: StoreStatus.ACTIVE, index: true })
  status: StoreStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: StoreBranding, default: () => ({}) })
  branding: StoreBranding;

  @Prop({ type: StoreSettings, default: () => ({}) })
  settings: StoreSettings;

  @Prop({ type: SubscriptionInfo, default: () => ({ status: 'TRIAL' }) })
  subscription: SubscriptionInfo;

  @Prop({ default: 0 })
  apiUsageCount: number;

  @Prop({ default: 0 })
  storageUsedMB: number;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ default: 0 })
  orderCount: number;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ name: 'text', slug: 'text' });
