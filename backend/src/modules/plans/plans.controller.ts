import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SuperAdminJwtAuthGuard } from '../super-admin-auth/guards/super-admin-jwt-auth.guard';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiOperation({ summary: 'Create a new subscription plan' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscription plans' })
  findAll(@Query('status') status?: string) {
    const query = status ? { status } : {};
    return this.plansService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiOperation({ summary: 'Update a subscription plan' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Patch(':id/status')
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiOperation({ summary: 'Update plan status (ACTIVE, INACTIVE, ARCHIVED)' })
  setStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.plansService.setStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiOperation({ summary: 'Delete a plan permanently' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
