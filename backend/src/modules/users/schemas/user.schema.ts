import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  SUPPORT = 'support',
  DEVELOPER = 'developer',
  // Backward compatibility alias
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ type: Types.ObjectId, ref: 'Store', index: true, default: null })
  storeId?: Types.ObjectId;

  @Prop({ type: [String], enum: Role, default: [Role.STAFF] })
  roles: Role[];

  @Prop({ type: [String], default: ['*'] })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiration?: Date;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ storeId: 1, email: 1 });
