import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

interface ProductFilter {
  isActive?: boolean;
  category?: string;
  brand?: string;
  price?: { $gte?: number; $lte?: number };
  stock?: { $gt: number };
  $text?: { $search: string };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: ListProductsDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 12);
    const skip = (page - 1) * limit;

    const filter: ProductFilter = { isActive: true };
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;

    const priceFilter: { $gte?: number; $lte?: number } = {};
    if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    if (query.inStock) filter.stock = { $gt: 0 };
    if (query.search) filter.$text = { $search: query.search };

    const sortOptions: Record<string, SortOrder> = {};
    if (query.sortBy === 'priceAsc') sortOptions.price = 1;
    else if (query.sortBy === 'priceDesc') sortOptions.price = -1;
    else if (query.sortBy === 'rating') sortOptions.rating = -1;
    else if (query.sortBy === 'newest') sortOptions.createdAt = -1;
    else sortOptions.title = 1;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { success: true };
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }

  async getBrands(): Promise<string[]> {
    return this.productModel.distinct('brand').exec();
  }

  async findFeatured(limit = 8) {
    return this.productModel
      .find({ isActive: true })
      .sort({ featured: -1, createdAt: -1, rating: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}
