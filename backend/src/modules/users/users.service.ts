import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, Role } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async updateProfile(id: string, updateUserDto: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByStore(storeId: string) {
    return this.userModel.find({ storeId: new Types.ObjectId(storeId) }).select('-password').exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ resetToken: token }).exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ verificationToken: token }).exec();
  }

  // ─── Super Admin Actions ──────────────────────────────────────────────────

  async findAllGlobalUsers(query: { search?: string, status?: boolean }) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status !== undefined) {
      filter.isActive = query.status;
    }

    return this.userModel
      .find(filter)
      .select('-password')
      .populate('storeId', 'name slug status')
      .sort({ createdAt: -1 })
      .exec();
  }

  async setStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
