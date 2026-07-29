import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';

@Injectable()
export class AttributesService {
  private readonly logger = new Logger(AttributesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttributeDto) {
    const existing = await this.prisma.tenant.attribute.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Attribute '${dto.name}' already exists`);
    }

    return this.prisma.tenant.attribute.create({
      data: {
        name: dto.name,
        type: dto.type || 'SELECT',
        values: dto.values
          ? {
              create: dto.values.map((v) => ({
                value: v.value,
                code: v.code,
              })),
            }
          : undefined,
      },
      include: { values: true },
    });
  }

  async addValue(attributeId: string, value: string, code?: string) {
    const attribute = await this.findOne(attributeId);
    return this.prisma.tenant.attributeValue.create({
      data: {
        attributeId: attribute.id,
        value,
        code,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.attribute.findMany({
      orderBy: { name: 'asc' },
      include: { values: true },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.tenant.attribute.findUnique({
      where: { id },
      include: { values: true },
    });
    if (!attribute) throw new NotFoundException(`Attribute #${id} not found`);
    return attribute;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.tenant.attribute.delete({ where: { id } });
    return { message: `Attribute #${id} deleted successfully` };
  }
}
