import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Ticket, TicketStatus, TicketType } from '@prisma/public-client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(
    storeId: string,
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<Ticket> {
    const initialMessage = {
      senderId: userId,
      senderRole: 'COMPANY_ADMIN',
      message: createTicketDto.message,
      attachments: createTicketDto.attachments || [],
      createdAt: new Date(),
    };

    try {
      return await this.prisma.client.ticket.create({
        data: {
          subject: createTicketDto.subject,
          type: createTicketDto.type as TicketType,
          storeId: storeId,
          createdById: userId,
          messages: [initialMessage] as any,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002' || error.code === 'P2003') {
        throw new BadRequestException('Invalid data provided');
      }
      throw error;
    }
  }

  async getTicketsForStore(storeId: string): Promise<Ticket[]> {
    return this.prisma.client.ticket.findMany({
      where: { storeId },
      orderBy: { updatedAt: 'desc' },
      include: { assignedTo: { select: { name: true, email: true, avatar: true } } }
    });
  }

  async getTickets(query: {
    status?: TicketStatus;
    type?: TicketType;
    storeId?: string;
  }): Promise<Ticket[]> {
    const where: Prisma.TicketWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.storeId) where.storeId = query.storeId;

    return this.prisma.client.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        store: { select: { name: true, slug: true } },
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      }
    });
  }

  async getTicketById(ticketId: string, storeId?: string): Promise<Ticket> {
    const where: Prisma.TicketWhereUniqueInput = { id: ticketId };
    if (storeId) {
      where.storeId = storeId;
    }

    const ticket = await this.prisma.client.ticket.findUnique({
      where,
      include: {
        store: { select: { name: true, slug: true } },
        createdBy: { select: { name: true, email: true, roles: true } },
        assignedTo: { select: { name: true, email: true, avatar: true } },
      }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
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

    const newMessage = {
      senderId,
      senderRole,
      message: replyDto.message,
      attachments: replyDto.attachments || [],
      createdAt: new Date(),
    };

    let messages = (ticket.messages as any[]) || [];
    messages.push(newMessage);

    let status = ticket.status;
    if (replyDto.status) {
      status = replyDto.status as TicketStatus;
    } else {
      if (status === TicketStatus.CLOSED && senderRole !== 'SUPER_ADMIN') {
        status = TicketStatus.OPEN;
      }
    }

    return this.prisma.client.ticket.update({
      where: { id: ticketId },
      data: { messages: messages as any, status }
    });
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    try {
      return await this.prisma.client.ticket.update({
        where: { id: ticketId },
        data: { status }
      });
    } catch {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }
  }

  async assignTicket(ticketId: string, adminId: string): Promise<Ticket> {
    try {
      return await this.prisma.public.ticket.update({
        where: { id: ticketId },
        data: { assignedToId: adminId }
      });
    } catch (error) {
      throw new NotFoundException(`Ticket #${ticketId} not found`);
    }
  }
}
