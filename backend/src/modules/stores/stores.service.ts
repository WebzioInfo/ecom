import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument, StoreStatus } from './schemas/store.schema';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeModel.findOne({
      slug: createStoreDto.slug,
    });
    if (existing) {
      throw new ConflictException(
        `Store with slug '${createStoreDto.slug}' already exists`,
      );
    }

    const store = new this.storeModel({
      ...createStoreDto,
      ownerId: new Types.ObjectId(createStoreDto.ownerId),
    });
    return store.save();
  }

  async findAll(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
      this.storeModel
        .find(filter)
        .populate('ownerId', 'name email roles')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.storeModel.countDocuments(filter),
    ]);

    return {
      data: stores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeModel
      .findById(id)
      .populate('ownerId', 'name email roles')
      .exec();
    if (!store) {
      throw new NotFoundException(`Store #${id} not found`);
    }
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeModel
      .findOne({ slug })
      .populate('ownerId', 'name email roles')
      .exec();
    if (!store) {
      throw new NotFoundException(`Store with slug '${slug}' not found`);
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storeModel
      .findByIdAndUpdate(id, { $set: updateStoreDto }, { new: true })
      .exec();
    if (!store) {
      throw new NotFoundException(`Store #${id} not found`);
    }
    return store;
  }

  async setStatus(id: string, status: StoreStatus): Promise<Store> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.storeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Store #${id} not found`);
    }
    return { message: `Store #${id} deleted successfully` };
  }

  async getGlobalAnalytics() {
    const [totalStores, activeStores, suspendedStores, aggregatedUsage] =
      await Promise.all([
        this.storeModel.countDocuments(),
        this.storeModel.countDocuments({ status: StoreStatus.ACTIVE }),
        this.storeModel.countDocuments({ status: StoreStatus.SUSPENDED }),
        this.storeModel.aggregate([
          {
            $group: {
              _id: null,
              totalApiRequests: { $sum: '$apiUsageCount' },
              totalStorageMB: { $sum: '$storageUsedMB' },
              totalProducts: { $sum: '$productCount' },
              totalOrders: { $sum: '$orderCount' },
            },
          },
        ]),
      ]);

    return {
      totalStores,
      activeStores,
      suspendedStores,
      totalApiRequests: aggregatedUsage[0]?.totalApiRequests || 0,
      totalStorageMB: aggregatedUsage[0]?.totalStorageMB || 0,
      totalProducts: aggregatedUsage[0]?.totalProducts || 0,
      totalOrders: aggregatedUsage[0]?.totalOrders || 0,
      systemHealth: '100% Operational',
    };
  }

  async getFullDetails(id: string): Promise<any> {
    const store = await this.storeModel
      .findById(id)
      .populate('ownerId', 'name email roles status lastLogin createdAt')
      .populate('subscription.planId')
      .exec();

    if (!store) {
      throw new NotFoundException(`Store #${id} not found`);
    }

    // In a real app, we'd also aggregate revenue here. Mocking some metrics for the dashboard.
    return {
      store,
      metrics: {
        totalRevenue: Math.floor(Math.random() * 50000), // Placeholder until orders module is linked
        monthlyRevenue: Math.floor(Math.random() * 10000),
      },
    };
  }

  async changePlan(id: string, planId: string): Promise<Store> {
    const store = await this.storeModel
      .findByIdAndUpdate(
        id,
        {
          'subscription.planId': new Types.ObjectId(planId),
          'subscription.renewalDate': new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ),
        },
        { new: true },
      )
      .populate('subscription.planId')
      .exec();

    if (!store) throw new NotFoundException(`Store #${id} not found`);
    return store;
  }

  async transferOwnership(id: string, newOwnerId: string): Promise<Store> {
    const store = await this.storeModel
      .findByIdAndUpdate(
        id,
        { ownerId: new Types.ObjectId(newOwnerId) },
        { new: true },
      )
      .populate('ownerId', 'name email')
      .exec();

    if (!store) throw new NotFoundException(`Store #${id} not found`);
    return store;
  }
}
