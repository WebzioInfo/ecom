import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { StorefrontApiService } from './storefront-api.service';

@ApiTags('Headless Storefront API v1 (Client Apps)')
@Controller('storefront/v1')
export class StorefrontApiController {
  constructor(private readonly storefrontApiService: StorefrontApiService) {}

  @Get('store')
  @ApiHeader({
    name: 'x-api-key',
    description: 'Store API Key',
    required: true,
  })
  @ApiOperation({ summary: 'Get public store branding & configuration' })
  getStoreInfo(@Headers('x-api-key') apiKey: string) {
    return this.storefrontApiService.getPublicStoreInfo(apiKey);
  }

  @Get('products')
  @ApiHeader({
    name: 'x-api-key',
    description: 'Store API Key',
    required: true,
  })
  @ApiOperation({ summary: 'List published products for storefront' })
  getProducts(
    @Headers('x-api-key') apiKey: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storefrontApiService.getPublicProducts(apiKey, {
      search,
      category,
      page: +page,
      limit: +limit,
    });
  }

  @Get('products/:sku')
  @ApiHeader({
    name: 'x-api-key',
    description: 'Store API Key',
    required: true,
  })
  @ApiOperation({ summary: 'Get product details by SKU' })
  getProductBySku(
    @Headers('x-api-key') apiKey: string,
    @Param('sku') sku: string,
  ) {
    return this.storefrontApiService.getPublicProductBySku(apiKey, sku);
  }
}
