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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new subscription plan' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscription plans with subscriber counts' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Update a subscription plan' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Duplicate an existing subscription plan' })
  duplicate(@Param('id') id: string) {
    return this.plansService.duplicate(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Update plan status (ACTIVE, INACTIVE, ARCHIVED)' })
  setStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.plansService.setStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Soft-delete / archive a subscription plan' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
