import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Team Management')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('team.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List team members' })
  listMembers(@Req() req: any) {
    return this.teamService.listMembers(req.user?.tenantId);
  }

  @Post('members')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('team.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite/Create a team member' })
  createMember(@Body() dto: any, @Req() req: any) {
    return this.teamService.createMember(req.user?.tenantId, req.user?.storeId, dto);
  }

  @Patch('members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('team.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team member' })
  updateMember(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.teamService.updateMember(req.user?.tenantId, id, dto);
  }

  @Delete('members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('team.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a team member' })
  removeMember(@Param('id') id: string, @Req() req: any) {
    return this.teamService.removeMember(req.user?.tenantId, id);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('team.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tenant roles' })
  listRoles(@Req() req: any) {
    return this.teamService.listRoles(req.user?.tenantId);
  }
}
