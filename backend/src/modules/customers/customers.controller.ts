import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Store Customers CRM')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Create a new customer profile' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get('store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'List all customers for a store' })
  findByStore(
    @Param('storeId') storeId: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.customersService.findByStore(storeId, { search, page: +page, limit: +limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'company_admin', 'manager')
  @ApiOperation({ summary: 'Update customer details' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({ summary: 'Delete customer record' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
