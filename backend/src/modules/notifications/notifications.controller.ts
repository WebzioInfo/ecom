import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({
    summary: 'Super Admin: Send a targeted or global notification',
  })
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  @Get('tenant')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({ summary: 'Store Admin: Get notifications for their store' })
  getStoreNotifications(@Request() req: any) {
    return this.notificationsService.getStoreNotifications(req.user.storeId);
  }

  @Get('global')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Get global platform notifications' })
  getGlobalNotifications() {
    return this.notificationsService.getGlobalNotifications();
  }

  @Patch(':id/read')
  @Roles('company_admin', 'admin', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('tenant/read-all')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({
    summary: 'Store Admin: Mark all store notifications as read',
  })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.storeId);
  }
}
