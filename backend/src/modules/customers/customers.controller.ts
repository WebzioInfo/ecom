import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { CreateCustomerAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Customers & Address Book')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new customer profile' })
  create(@Body() dto: CreateCustomerDto, @Req() req: any) {
    return this.customersService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customers with search and pagination' })
  findAll(@Query() query: ListCustomersDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer details by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: any,
  ) {
    return this.customersService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete customer' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.customersService.softDelete(id, req.user?.userId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('customers.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore soft deleted customer' })
  restore(@Param('id') id: string, @Req() req: any) {
    return this.customersService.restore(id, req.user?.userId);
  }

  // --- Address Book Endpoints ---

  @Post(':id/addresses')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Add a new address for a customer' })
  addAddress(
    @Param('id') id: string,
    @Body() dto: CreateCustomerAddressDto,
  ) {
    return this.customersService.addAddress(id, dto);
  }

  @Patch('addresses/:addressId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Update customer address' })
  updateAddress(
    @Param('addressId') addressId: string,
    @Body() dto: Partial<CreateCustomerAddressDto>,
  ) {
    return this.customersService.updateAddress(addressId, dto);
  }

  @Delete('addresses/:addressId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Delete customer address' })
  deleteAddress(@Param('addressId') addressId: string) {
    return this.customersService.deleteAddress(addressId);
  }
}
