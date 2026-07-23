import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {  TicketStatus, TicketType  } from '@prisma/public-client';
import type { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ─── Store Admin Routes ────────────────────────────────────────────────────────

  @Post('tenant')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({ summary: 'Store Admin: Create a new support ticket' })
  createTicket(
    @Request() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(
      req.user!.storeId!,
      req.user!.userId || req.user!.id!,
      createTicketDto,
    );
  }

  @Get('tenant')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({ summary: 'Store Admin: Get all tickets for their store' })
  getStoreTickets(@Request() req: AuthenticatedRequest) {
    return this.supportService.getTicketsForStore(req.user!.storeId!);
  }

  @Get('tenant/:id')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({ summary: 'Store Admin: Get a specific ticket' })
  getStoreTicket(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.supportService.getTicketById(id, req.user!.storeId);
  }

  @Post('tenant/:id/reply')
  @Roles('company_admin', 'admin', 'staff')
  @ApiOperation({ summary: 'Store Admin: Reply to a ticket' })
  replyToTicketStore(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() replyDto: ReplyTicketDto,
  ) {
    // Determine exact role from JWT
    const role = req.user?.roles?.includes('company_admin')
      ? 'COMPANY_ADMIN'
      : 'STAFF';
    return this.supportService.replyToTicket(
      id,
      req.user!.userId || req.user!.id!,
      role,
      replyDto,
      req.user!.storeId,
    );
  }

  // ─── Super Admin Routes ────────────────────────────────────────────────────────

  @Get('global')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Get all tickets globally' })
  getTickets(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.supportService.getTickets({
      status: status as TicketStatus,
      type: type as TicketType,
      storeId,
    });
  }

  @Get('global/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Get ticket details' })
  getGlobalTicket(@Param('id') id: string) {
    return this.supportService.getTicketById(id); // no storeId constraint
  }

  @Post('global/:id/reply')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Reply to a ticket' })
  replyToTicketGlobal(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() replyDto: ReplyTicketDto,
  ) {
    return this.supportService.replyToTicket(
      id,
      req.user!.userId || req.user!.id!,
      'SUPER_ADMIN',
      replyDto,
    );
  }

  @Patch('global/:id/status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Super Admin: Update ticket status' })
  updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.supportService.updateTicketStatus(id, status);
  }

  @Patch('global/:id/assign')
  @Roles('super_admin')
  @ApiOperation({
    summary: 'Super Admin: Assign ticket to self or another super admin',
  })
  assignTicket(
    @Param('id') id: string,
    @Body('superAdminId') superAdminId: string,
  ) {
    return this.supportService.assignTicket(id, superAdminId);
  }
}
