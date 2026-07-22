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

  // ─── Super Admin Actions ──────────────────────────────────────────────────

  @Get('global')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Get all store admins globally' })
  async getGlobalUsers(@Request() req: any) {
    // We can pull query params from req.query if needed, keeping simple for now
    return this.usersService.findAllGlobalUsers({
      search: req.query.search,
      status: req.query.status ? req.query.status === 'true' : undefined
    });
  }

  @Patch('global/:id/suspend')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Suspend a user account' })
  async suspendUser(@Param('id') id: string) {
    return this.usersService.setStatus(id, false);
  }

  @Patch('global/:id/activate')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Activate a suspended user account' })
  async activateUser(@Param('id') id: string) {
    return this.usersService.setStatus(id, true);
  }
}
