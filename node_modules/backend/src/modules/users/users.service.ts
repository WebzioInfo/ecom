import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

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

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ resetToken: token }).exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ verificationToken: token }).exec();
  }

  async getWishlist(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('wishlist')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.wishlist;
  }

  async addToWishlist(userId: string, productId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: new Types.ObjectId(productId) } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.wishlist;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: new Types.ObjectId(productId) } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.wishlist;
  }
}
