import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Plan } from '@prisma/public-client';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const existingPlan = await this.prisma.client.plan.findUnique({
      where: { code: createPlanDto.code }
    });
    if (existingPlan) {
      throw new ConflictException(`Plan with code ${createPlanDto.code} already exists`);
    }
    return this.prisma.client.plan.create({ data: createPlanDto as any });
  }

  async findAll(query: any = {}): Promise<Plan[]> {
    return this.prisma.client.plan.findMany({
      where: query,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.prisma.client.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    if (updatePlanDto.code) {
      const existingPlan = await this.prisma.client.plan.findFirst({
        where: { code: updatePlanDto.code, id: { not: id } }
      });
      if (existingPlan) {
        throw new ConflictException(`Plan with code ${updatePlanDto.code} already exists`);
      }
    }
    try {
      return await this.prisma.client.plan.update({
        where: { id },
        data: updatePlanDto as any
      });
    } catch {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.client.plan.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async setStatus(id: string, status: string): Promise<Plan> {
    try {
      return await this.prisma.client.plan.update({
        where: { id },
        data: { status }
      });
    } catch {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }
}
