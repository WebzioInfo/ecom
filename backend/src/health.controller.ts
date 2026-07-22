import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import * as os from 'os';

@ApiTags('System')
@Controller('health')
export class HealthController {
  
  @Get()
  @ApiOperation({ summary: 'Basic public health check' })
  healthCheck(): string {
    return 'OK';
  }

  @Get('metrics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Get detailed system metrics' })
  getSystemMetrics() {
    return {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        process: process.memoryUsage(),
      },
      cpu: os.cpus(),
      status: 'Operational',
      activeWebSockets: 4281, // Mock value as Socket.io isn't fully integrated yet
      dbLatency: '14ms', // Mocked latency
      backgroundQueues: 0,
    };
  }
}
