import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private planModel: Model<PlanDocument>) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const existingPlan = await this.planModel.findOne({ code: createPlanDto.code });
    if (existingPlan) {
      throw new ConflictException(`Plan with code ${createPlanDto.code} already exists`);
    }
    const createdPlan = new this.planModel(createPlanDto);
    return createdPlan.save();
  }

  async findAll(query: any = {}): Promise<Plan[]> {
    return this.planModel.find(query).sort({ displayOrder: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    if (updatePlanDto.code) {
      const existingPlan = await this.planModel.findOne({ code: updatePlanDto.code, _id: { $ne: id } });
      if (existingPlan) {
        throw new ConflictException(`Plan with code ${updatePlanDto.code} already exists`);
      }
    }
    const updatedPlan = await this.planModel
      .findByIdAndUpdate(id, updatePlanDto, { new: true })
      .exec();
    if (!updatedPlan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return updatedPlan;
  }

  async remove(id: string): Promise<void> {
    const result = await this.planModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async setStatus(id: string, status: string): Promise<Plan> {
    const updatedPlan = await this.planModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updatedPlan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return updatedPlan;
  }
}
