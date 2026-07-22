import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { ApiKey, ApiKeyDocument } from '../api-keys/schemas/api-key.schema';

@Injectable()
export class StorefrontApiService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async validateApiKey(apiKey: string) {
    const keyDoc = await this.apiKeyModel
      .findOne({ key: apiKey, isActive: true })
      .exec();
    if (!keyDoc) {
      throw new UnauthorizedException('Invalid or inactive Store API Key');
    }
    // Update last used timestamp async
    this.apiKeyModel
      .updateOne({ _id: keyDoc._id }, { lastUsedAt: new Date() })
      .exec();
    return keyDoc;
  }

  async getPublicStoreInfo(apiKey: string) {
    const keyDoc = await this.validateApiKey(apiKey);
    const store = await this.storeModel
      .findById(keyDoc.storeId)
      .select('-ownerId -apiUsageCount')
      .exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return {
      id: store._id,
      name: store.name,
      slug: store.slug,
      branding: store.branding,
      settings: {
        currency: store.settings?.currency,
        timezone: store.settings?.timezone,
        taxPercentage: store.settings?.taxPercentage,
      },
    };
  }

  async getPublicProducts(
    apiKey: string,
    query: {
      search?: string;
      category?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const keyDoc = await this.validateApiKey(apiKey);
    const { search, category, page = 1, limit = 20 } = query;
    const filter: any = { storeId: keyDoc.storeId, isActive: true };

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicProductBySku(apiKey: string, sku: string) {
    const keyDoc = await this.validateApiKey(apiKey);
    const product = await this.productModel
      .findOne({ storeId: keyDoc.storeId, sku, isActive: true })
      .exec();
    if (!product)
      throw new NotFoundException(`Product with SKU '${sku}' not found`);
    return product;
  }
}
