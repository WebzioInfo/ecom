import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ _id: false })
class PlanLimits {
  @Prop({ required: true })
  maxProducts: number;

  @Prop({ required: true })
  maxCategories: number;

  @Prop({ required: true })
  maxOrders: number;

  @Prop({ required: true })
  maxCustomers: number;

  @Prop({ required: true })
  maxStaff: number;

  @Prop({ required: true })
  maxWarehouses: number;

  @Prop({ required: true }) // In MB
  maxStorageMB: number;

  @Prop({ required: true })
  maxApiRequestsPerMonth: number;

  @Prop({ required: true })
  maxIntegrations: number;
}

@Schema({ _id: false })
class PlanFeatures {
  @Prop({ default: false })
  customDomain: boolean;

  @Prop({ default: false })
  apiAccess: boolean;

  @Prop({ default: false })
  webhooks: boolean;

  @Prop({ default: false })
  advancedAnalytics: boolean;

  @Prop({ default: false })
  customReports: boolean;

  @Prop({ default: false })
  coupons: boolean;

  @Prop({ default: false })
  productReviews: boolean;

  @Prop({ default: false })
  advancedInventory: boolean;

  @Prop({ default: false })
  multiWarehouse: boolean;

  @Prop({ default: false })
  marketingTools: boolean;

  @Prop({ default: false })
  advancedShipping: boolean;

  @Prop({ default: false })
  multiplePaymentGateways: boolean;

  @Prop({ default: false })
  staffManagement: boolean;

  @Prop({ default: false })
  auditLogs: boolean;

  @Prop({ default: false })
  aiFeatures: boolean;
}

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  code: string; // e.g. 'STARTER_PLAN'

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  monthlyPrice: number;

  @Prop({ required: true, min: 0 })
  yearlyPrice: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true, default: 0 })
  trialDays: number;

  @Prop({
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ default: false })
  popularBadge: boolean;

  @Prop({ default: false })
  recommendedBadge: boolean;

  @Prop({ type: PlanLimits, required: true })
  limits: PlanLimits;

  @Prop({ type: PlanFeatures, required: true })
  features: PlanFeatures;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
