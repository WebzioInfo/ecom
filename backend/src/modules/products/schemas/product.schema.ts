import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  DIGITAL = 'digital',
  SUBSCRIPTION = 'subscription',
  BUNDLE = 'bundle',
}

@Schema({ _id: false })
export class ProductVariant {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ type: Map, of: String })
  attributes: Map<string, string>; // e.g. { size: 'M', color: 'Blue' }

  @Prop()
  barcode?: string;
}

@Schema({ _id: false })
export class ProductSEO {
  @Prop() metaTitle?: string;
  @Prop() metaDescription?: string;
  @Prop([String]) keywords?: string[];
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ required: true, index: true })
  sku: string;

  @Prop()
  barcode?: string;

  @Prop({ type: String, enum: ProductType, default: ProductType.SIMPLE })
  productType: ProductType;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ required: true, index: true })
  brand: string;

  @Prop([String])
  images: string[];

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ type: ProductSEO, default: () => ({}) })
  seo: ProductSEO;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discount: number;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ storeId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ title: 'text', description: 'text', sku: 'text' });
ProductSchema.index({ storeId: 1, category: 1 });
ProductSchema.index({ storeId: 1, brand: 1 });
