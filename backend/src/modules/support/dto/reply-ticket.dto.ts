import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../schemas/ticket.schema';

export class ReplyTicketDto {
  @ApiProperty({ description: 'The message content' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Optional array of attachment URLs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Change status if needed (e.g. closing)',
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
