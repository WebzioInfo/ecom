import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ _id: false })
export class CustomerAddress {
  @Prop() street: string;
  @Prop() city: string;
  @Prop() state: string;
  @Prop() postalCode: string;
  @Prop() country: string;
  @Prop({ default: false }) isDefault: boolean;
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, index: true })
  firstName: string;

  @Prop({ required: true, index: true })
  lastName: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ type: [CustomerAddress], default: [] })
  addresses: CustomerAddress[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ storeId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
