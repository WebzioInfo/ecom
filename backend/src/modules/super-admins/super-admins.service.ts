import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuperAdmin } from './schemas/super-admin.schema';

@Injectable()
export class SuperAdminsService {
  constructor(
    @InjectModel(SuperAdmin.name) private superAdminModel: Model<SuperAdmin>,
  ) {}

  async create(createData: Partial<SuperAdmin>): Promise<SuperAdmin> {
    const newAdmin = new this.superAdminModel(createData);
    return newAdmin.save();
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    return this.superAdminModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<SuperAdmin | null> {
    return this.superAdminModel.findById(id).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.superAdminModel
      .findByIdAndUpdate(id, { lastLogin: new Date() })
      .exec();
  }

  async recordLoginHistory(
    id: string,
    ip: string,
    device: string,
  ): Promise<void> {
    await this.superAdminModel
      .findByIdAndUpdate(id, {
        $push: {
          loginHistory: {
            $each: [{ ip, device, createdAt: new Date() }],
            $slice: -50, // keep last 50 entries
          },
        },
        lastLogin: new Date(),
      })
      .exec();
  }

  async count(): Promise<number> {
    return this.superAdminModel.countDocuments().exec();
  }
}
