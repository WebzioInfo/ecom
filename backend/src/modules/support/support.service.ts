import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Ticket, TicketStatus, TicketType } from '@prisma/public-client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { randomUUID } from 'crypto';

export interface SupportMessageItem {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  isRead?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedById?: string;
  createdAt: string;
}

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(
    storeId: string,
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<Ticket> {
    const initialMessage: SupportMessageItem = {
      id: randomUUID(),
      senderId: userId,
      senderRole: 'STORE_OWNER',
      message: createTicketDto.message,
      attachments: createTicketDto.attachments || [],
      isRead: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    try {
      return await this.prisma.public.ticket.create({
        data: {
          subject: createTicketDto.subject,
          type: createTicketDto.type as TicketType,
          storeId: storeId,
          createdById: userId,
          messages: [initialMessage] as any,
          isDeleted: false,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' || error.code === 'P2003') {
        throw new BadRequestException('Invalid store or user reference');
      }
      throw error;
    }
  }

  async getTicketsForStore(storeId: string): Promise<Ticket[]> {
    return this.prisma.public.ticket.findMany({
      where: { storeId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        store: { select: { name: true, slug: true } },
      },
    });
  }

  async getTickets(query: {
    status?: TicketStatus;
    type?: TicketType;
    storeId?: string;
    includeDeleted?: boolean;
  }): Promise<Ticket[]> {
    const where: Prisma.TicketWhereInput = {};
    if (!query.includeDeleted) {
      where.isDeleted = false;
    }
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.storeId) where.storeId = query.storeId;

    return this.prisma.public.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        store: { select: { name: true, slug: true, owner: { select: { name: true, email: true } } } },
      },
    });
  }

  async getStoreSupportSummaries() {
    const stores = await this.prisma.public.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        status: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    const tickets = await this.prisma.public.ticket.findMany({
      where: { isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    });

    return stores.map((store) => {
      const storeTickets = tickets.filter((t) => t.storeId === store.id);
      const latestTicket = storeTickets[0];
      
      let unreadCount = 0;
      let lastMessage = 'No messages yet';
      let lastActivity = store.createdAt;

      if (latestTicket) {
        const msgs = ((latestTicket.messages as any[]) || []) as SupportMessageItem[];
        const validMsgs = msgs.filter((m) => !m.isDeleted);
        if (validMsgs.length > 0) {
          const lastMsg = validMsgs[validMsgs.length - 1];
          lastMessage = lastMsg.message;
          lastActivity = new Date(lastMsg.createdAt);
          unreadCount = validMsgs.filter((m) => m.senderRole !== 'SUPER_ADMIN' && !m.isRead).length;
        }
      }

      return {
        storeId: store.id,
        storeName: store.name,
        slug: store.slug,
        ownerName: store.owner?.name || 'Owner',
        ownerEmail: store.owner?.email || '',
        status: store.status,
        ticketId: latestTicket?.id || '',
        ticketStatus: latestTicket?.status || 'NONE',
        unreadCount,
        lastMessage,
        lastActivity,
      };
    });
  }

  async getTicketById(ticketId: string, storeId?: string): Promise<Ticket> {
    const where: Prisma.TicketWhereUniqueInput = { id: ticketId };

    const ticket = await this.prisma.public.ticket.findUnique({
      where,
      include: {
        store: { select: { name: true, slug: true, owner: { select: { name: true, email: true } } } },
      },
    });

    if (!ticket || ticket.isDeleted) {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }

    if (storeId && ticket.storeId !== storeId) {
      throw new ForbiddenException('Access denied to ticket from another store');
    }

    return ticket;
  }

  async replyToTicket(
    ticketId: string,
    senderId: string,
    senderRole: string,
    replyDto: ReplyTicketDto,
    storeId?: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, storeId);

    const newMessage: SupportMessageItem = {
      id: randomUUID(),
      senderId,
      senderRole,
      message: replyDto.message,
      attachments: replyDto.attachments || [],
      isRead: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    const messages = ((ticket.messages as any[]) || []) as SupportMessageItem[];
    messages.push(newMessage);

    let status = ticket.status;
    if (replyDto.status) {
      status = replyDto.status as TicketStatus;
    } else if (status === TicketStatus.CLOSED && senderRole !== 'SUPER_ADMIN') {
      status = TicketStatus.OPEN;
    }

    return this.prisma.public.ticket.update({
      where: { id: ticketId },
      data: { messages: messages as any, status },
    });
  }

  async markAsRead(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId);
    const messages = ((ticket.messages as any[]) || []) as SupportMessageItem[];

    let updated = false;
    for (const m of messages) {
      if (m.senderId !== userId && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    }

    if (!updated) return ticket;

    return this.prisma.public.ticket.update({
      where: { id: ticketId },
      data: { messages: messages as any },
    });
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    try {
      return await this.prisma.public.ticket.update({
        where: { id: ticketId },
        data: { status },
      });
    } catch {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }
  }

  async closeTicket(ticketId: string, userId: string, storeId?: string): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, storeId);
    return this.prisma.public.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.CLOSED },
    });
  }

  async reopenTicket(ticketId: string, userId: string, storeId?: string): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, storeId);
    return this.prisma.public.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.OPEN },
    });
  }

  async softDeleteTicket(ticketId: string, userId: string, storeId?: string): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, storeId);
    return this.prisma.public.ticket.update({
      where: { id: ticket.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }

  async softDeleteMessage(
    ticketId: string,
    messageId: string,
    userId: string,
    storeId?: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, storeId);
    const messages = ((ticket.messages as any[]) || []) as SupportMessageItem[];

    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) {
      throw new NotFoundException(`Message #${messageId} not found in ticket #${ticketId}`);
    }

    messages[msgIndex].isDeleted = true;
    messages[msgIndex].deletedAt = new Date().toISOString();
    messages[msgIndex].deletedById = userId;

    return this.prisma.public.ticket.update({
      where: { id: ticket.id },
      data: { messages: messages as any },
    });
  }

  async assignTicket(ticketId: string, adminId: string): Promise<Ticket> {
    try {
      return await this.prisma.public.ticket.update({
        where: { id: ticketId },
        data: { assignedToId: adminId },
      });
    } catch (error) {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }
  }
}
