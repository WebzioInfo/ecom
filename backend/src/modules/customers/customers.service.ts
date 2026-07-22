import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = new this.customerModel({
      ...dto,
      storeId: new Types.ObjectId(dto.storeId),
    });
    return customer.save();
  }

  async findByStore(
    storeId: string,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const { search, page = 1, limit = 20 } = query;
    const filter: any = { storeId: new Types.ObjectId(storeId) };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customerModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) throw new NotFoundException(`Customer #${id} not found`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!customer) throw new NotFoundException(`Customer #${id} not found`);
    return customer;
  }

  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.customerModel.findByIdAndDelete(id).exec();
    if (!customer) throw new NotFoundException(`Customer #${id} not found`);
    return { message: `Customer #${id} deleted successfully` };
  }
}
