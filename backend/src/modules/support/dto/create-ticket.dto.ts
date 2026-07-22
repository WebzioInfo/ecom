import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketType } from '../schemas/ticket.schema';

export class CreateTicketDto {
  @ApiProperty({ description: 'The subject of the support ticket' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ enum: TicketType, description: 'Type of the ticket' })
  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @ApiProperty({ description: 'The initial message content' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Optional array of attachment URLs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
