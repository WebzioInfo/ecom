import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

// ─── Login History Sub-document ───────────────────────────────────────────────

@Schema({ _id: false })
class LoginHistoryEntry {
  @Prop({ default: 'unknown' })
  ip: string;

  @Prop({ default: 'unknown' })
  device: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

// ─── Super Admin Document ─────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'super_admins' })
export class SuperAdmin extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop({ default: 'SUPER_ADMIN' })
  role: string;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ type: [Object], default: [] })
  loginHistory: LoginHistoryEntry[];
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin);

// Hash password before saving (only if modified)
// Mongoose 9+ supports returning a Promise directly in pre hooks
SuperAdminSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
