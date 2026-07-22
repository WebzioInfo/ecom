import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'STAFF'],
    required: true,
  })
  senderRole: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export enum TicketType {
  TECHNICAL_ISSUE = 'technical_issue',
  BILLING = 'billing',
  SUBSCRIPTION = 'subscription',
  FEATURE_REQUEST = 'feature_request',
  GENERAL_SUPPORT = 'general_support',
}

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  subject: string;

  @Prop({ type: String, enum: TicketType, required: true })
  type: TicketType;

  @Prop({ type: String, enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SuperAdmin' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.index({ storeId: 1, status: 1 });
