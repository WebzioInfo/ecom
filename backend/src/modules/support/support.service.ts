import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Ticket,
  TicketDocument,
  TicketMessage,
  TicketStatus,
  TicketType,
} from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async createTicket(
    storeId: string,
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<TicketDocument> {
    const initialMessage: TicketMessage = {
      senderId: new Types.ObjectId(userId),
      senderRole: 'COMPANY_ADMIN',
      message: createTicketDto.message,
      attachments: createTicketDto.attachments || [],
      createdAt: new Date(),
    };

    const ticket = new this.ticketModel({
      subject: createTicketDto.subject,
      type: createTicketDto.type,
      storeId: new Types.ObjectId(storeId),
      createdBy: new Types.ObjectId(userId),
      messages: [initialMessage],
    });

    try {
      return await ticket.save();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'ValidationError'
      ) {
        throw new BadRequestException((error as Error).message);
      }
      throw error;
    }
  }

  async getTicketsForStore(storeId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .sort({ updatedAt: -1 })
      .populate('assignedTo', 'name email avatar')
      .exec();
  }

  async getTickets(query: {
    status?: TicketStatus;
    type?: TicketType;
    storeId?: string;
  }): Promise<Ticket[]> {
    const filter = {
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.storeId && { storeId: new Types.ObjectId(query.storeId) }),
    };

    return this.ticketModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('storeId', 'name slug')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .exec();
  }

  async getTicketById(
    ticketId: string,
    storeId?: string,
  ): Promise<TicketDocument> {
    const filter = {
      _id: new Types.ObjectId(ticketId),
      ...(storeId && { storeId: new Types.ObjectId(storeId) }),
    };

    const ticket = await this.ticketModel
      .findOne(filter)
      .populate('storeId', 'name slug')
      .populate('createdBy', 'name email roles')
      .populate('assignedTo', 'name email avatar')
      .exec();

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

    const newMessage: TicketMessage = {
      senderId: new Types.ObjectId(senderId),
      senderRole,
      message: replyDto.message,
      attachments: replyDto.attachments || [],
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);

    if (replyDto.status) {
      ticket.status = replyDto.status;
    } else {
      // Auto reopen if customer replies to closed ticket
      if (
        ticket.status === TicketStatus.CLOSED &&
        senderRole !== 'SUPER_ADMIN'
      ) {
        ticket.status = TicketStatus.OPEN;
      }
    }

    return ticket.save();
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(ticketId, { status }, { new: true })
      .exec();
    if (!ticket) throw new NotFoundException(`Ticket #${ticketId} not found`);
    return ticket;
  }

  async assignTicket(ticketId: string, superAdminId: string): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        ticketId,
        { assignedTo: new Types.ObjectId(superAdminId) },
        { new: true },
      )
      .exec();

    if (!ticket) throw new NotFoundException(`Ticket #${ticketId} not found`);
    return ticket;
  }
}
