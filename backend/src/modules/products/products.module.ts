import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { BrandsController } from './brands/brands.controller';
import { BrandsService } from './brands/brands.service';
import { AttributesController } from './attributes/attributes.controller';
import { AttributesService } from './attributes/attributes.service';


@Module({
  controllers: [
    ProductsController,
    CategoriesController,
    BrandsController,
    AttributesController,
  ],
  providers: [
    ProductsService,
    CategoriesService,
    BrandsService,
    AttributesService,
  ],
  exports: [
    ProductsService,
    CategoriesService,
    BrandsService,
    AttributesService,
  ],
})
export class ProductsModule {}
