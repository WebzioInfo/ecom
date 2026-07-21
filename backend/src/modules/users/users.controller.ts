import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthRequest {
  user: {
    userId: string;
    roles: string[];
    storeId?: string;
  };
}

@ApiTags('System Users & Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get profile of current system user' })
  async getProfile(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile of current user' })
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateUserDto);
  }

  @Get('store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'manager')
  @ApiOperation({ summary: 'Get staff members for a specific store' })
  async findByStore(@Param('storeId') storeId: string) {
    return this.usersService.findByStore(storeId);
  }
}
