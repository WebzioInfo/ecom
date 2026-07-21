import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs & Compliance')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get('store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({ summary: 'Get audit logs for a specific store' })
  findByStore(@Param('storeId') storeId: string, @Query('limit') limit = 50) {
    return this.auditLogsService.findByStore(storeId, +limit);
  }

  @Get('global')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get global system audit logs' })
  findGlobal(@Query('limit') limit = 100) {
    return this.auditLogsService.findGlobal(+limit);
  }
}
