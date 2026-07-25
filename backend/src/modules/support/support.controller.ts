import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
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
import { TicketStatus, TicketType } from '@prisma/public-client';
import type { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('Support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ─── Store Admin Routes ────────────────────────────────────────────────────────

  @Post('tenant')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Store Admin: Create a new support ticket' })
  createTicket(
    @Request() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const storeId = req.user!.storeId!;
    return this.supportService.createTicket(storeId, userId, createTicketDto);
  }

  @Get('tenant')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Store Admin: Get all tickets for their store' })
  getStoreTickets(@Request() req: AuthenticatedRequest) {
    const storeId = req.user!.storeId!;
    return this.supportService.getTicketsForStore(storeId);
  }

  @Get('tenant/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Store Admin: Get a specific ticket' })
  getStoreTicket(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.supportService.getTicketById(id, req.user!.storeId);
  }

  @Post('tenant/:id/reply')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Store Admin: Reply to a ticket' })
  replyToTicketStore(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() replyDto: ReplyTicketDto,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const role = req.user?.role || 'STORE_OWNER';
    return this.supportService.replyToTicket(
      id,
      userId,
      role,
      replyDto,
      req.user!.storeId,
    );
  }

  @Patch('read/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Mark messages in ticket as read' })
  markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    return this.supportService.markAsRead(id, userId);
  }

  // Unified reply route specified in mandate: POST /support/reply
  @Post('reply')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Unified: Reply to a ticket' })
  replyToTicketUnified(
    @Request() req: AuthenticatedRequest,
    @Body() body: ReplyTicketDto & { ticketId: string },
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.roles?.includes('SUPER_ADMIN' as any);
    const storeId = isSuperAdmin ? undefined : req.user!.storeId;
    return this.supportService.replyToTicket(
      body.ticketId,
      userId,
      req.user?.role || 'USER',
      body,
      storeId,
    );
  }

  @Delete('ticket/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete a support ticket' })
  deleteTicket(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.roles?.includes('SUPER_ADMIN' as any);
    const storeId = isSuperAdmin ? undefined : req.user!.storeId;
    return this.supportService.softDeleteTicket(id, userId, storeId);
  }

  @Delete('message/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete a specific message inside a ticket' })
  deleteMessage(
    @Request() req: AuthenticatedRequest,
    @Param('id') messageId: string,
    @Query('ticketId') ticketId: string,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.roles?.includes('SUPER_ADMIN' as any);
    const storeId = isSuperAdmin ? undefined : req.user!.storeId;
    return this.supportService.softDeleteMessage(ticketId, messageId, userId, storeId);
  }

  @Patch('close/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Close a ticket' })
  closeTicket(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.roles?.includes('SUPER_ADMIN' as any);
    const storeId = isSuperAdmin ? undefined : req.user!.storeId;
    return this.supportService.closeTicket(id, userId, storeId);
  }

  @Patch('reopen/:id')
  @Roles('STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Reopen a ticket' })
  reopenTicket(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.roles?.includes('SUPER_ADMIN' as any);
    const storeId = isSuperAdmin ? undefined : req.user!.storeId;
    return this.supportService.reopenTicket(id, userId, storeId);
  }

  // ─── Super Admin Routes ────────────────────────────────────────────────────────

  @Get('global/summaries')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Get all stores with unread counts & last messages' })
  getStoreSupportSummaries() {
    return this.supportService.getStoreSupportSummaries();
  }

  @Get('global')
  @Roles('SUPER_ADMIN')
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
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Get ticket details' })
  getGlobalTicket(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Post('global/:id/reply')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Reply to a ticket' })
  replyToTicketGlobal(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() replyDto: ReplyTicketDto,
  ) {
    const userId = req.user!.userId || req.user!.id || req.user!.sub!;
    return this.supportService.replyToTicket(
      id,
      userId,
      'SUPER_ADMIN',
      replyDto,
    );
  }

  @Patch('global/:id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Update ticket status' })
  updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.supportService.updateTicketStatus(id, status);
  }

  @Patch('global/:id/assign')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super Admin: Assign ticket to self or another super admin' })
  async assignTicket(
    @Param('id') id: string,
    @Body('adminId') adminId: string,
  ) {
    return this.supportService.assignTicket(id, adminId);
  }
}
