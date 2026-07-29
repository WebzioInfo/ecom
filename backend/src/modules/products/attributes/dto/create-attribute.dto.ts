import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';

export class CreateAttributeValueDto {
  @ApiProperty({ description: 'Attribute Value string', example: 'Red' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Attribute Code (e.g. Hex color)', example: '#FF0000' })
  @IsOptional()
  @IsString()
  code?: string;
}

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute Name', example: 'Color' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: AttributeType, default: AttributeType.SELECT })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({ type: [CreateAttributeValueDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueDto)
  values?: CreateAttributeValueDto[];
}
