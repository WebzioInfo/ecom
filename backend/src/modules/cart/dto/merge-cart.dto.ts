import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergeCartDto {
  @ApiProperty({ description: 'Guest Session Token to merge from' })
  @IsString()
  @IsNotEmpty()
  sessionToken: string;

  @ApiProperty({ description: 'Customer ID to merge into' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
