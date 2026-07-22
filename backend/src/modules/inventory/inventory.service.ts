import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { CreateWarehouseDto, AdjustStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Warehouse.name)
    private warehouseModel: Model<WarehouseDocument>,
  ) {}

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = new this.warehouseModel({
      ...dto,
      storeId: new Types.ObjectId(dto.storeId),
    });
    return warehouse.save();
  }

  async findWarehousesByStore(storeId: string) {
    return this.warehouseModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .exec();
  }

  adjustStock(dto: AdjustStockDto) {
    // Audit log / Stock level update handler
    return {
      storeId: dto.storeId,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      quantityDelta: dto.quantityDelta,
      reason: dto.reason || 'Manual Adjustment',
      updatedAt: new Date(),
    };
  }
}
