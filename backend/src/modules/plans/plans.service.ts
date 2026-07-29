import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan } from '@prisma/public-client';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const existingPlan = await this.prisma.public.plan.findUnique({
      where: { code: createPlanDto.code },
    });
    if (existingPlan) {
      throw new ConflictException(`Plan with code '${createPlanDto.code}' already exists`);
    }
    return this.prisma.public.plan.create({ data: createPlanDto as any });
  }

  async findAll(query: any = {}): Promise<any[]> {
    const plans = await this.prisma.public.plan.findMany({
      where: query,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const stores = await this.prisma.public.store.findMany({
      select: { subscription: true },
    });

    return plans.map((plan: any) => {
      const subscribers = stores.filter((s: any) => {
        const sub = (s.subscription as any) || {};
        return sub.planId === plan.id || sub.planId === plan.code;
      }).length;

      return {
        ...plan,
        subscriberCount: subscribers,
      };
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.prisma.public.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID #${id} not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    if (updatePlanDto.code) {
      const existingPlan = await this.prisma.public.plan.findFirst({
        where: { code: updatePlanDto.code, id: { not: id } },
      });
      if (existingPlan) {
        throw new ConflictException(`Plan with code '${updatePlanDto.code}' already exists`);
      }
    }
    try {
      return await this.prisma.public.plan.update({
        where: { id },
        data: updatePlanDto as any,
      });
    } catch {
      throw new NotFoundException(`Plan with ID #${id} not found`);
    }
  }

  async duplicate(id: string): Promise<Plan> {
    const original = await this.findOne(id);
    const newCode = `${original.code}-copy-${Date.now().toString().slice(-4)}`;
    const newName = `${original.name} (Copy)`;

    return this.prisma.public.plan.create({
      data: {
        name: newName,
        code: newCode,
        description: original.description,
        monthlyPrice: original.monthlyPrice,
        yearlyPrice: original.yearlyPrice,
        currency: original.currency,
        trialDays: original.trialDays,
        status: 'ACTIVE',
        popularBadge: false,
        recommendedBadge: false,
        limits: original.limits as any,
        features: original.features as any,
        displayOrder: original.displayOrder + 1,
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const plan = await this.findOne(id);
    if (plan.status === 'ARCHIVED') {
      await this.prisma.public.plan.delete({ where: { id } });
      return { message: `Plan #${id} deleted permanently` };
    }

    await this.prisma.public.plan.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return { message: `Plan #${id} archived successfully` };
  }

  async setStatus(id: string, status: string): Promise<Plan> {
    try {
      return await this.prisma.public.plan.update({
        where: { id },
        data: { status },
      });
    } catch {
      throw new NotFoundException(`Plan with ID #${id} not found`);
    }
  }
}
