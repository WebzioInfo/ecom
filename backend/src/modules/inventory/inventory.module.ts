import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { WarehousesController } from './warehouses/warehouses.controller';
import { WarehousesService } from './warehouses/warehouses.service';
import { SuppliersController } from './suppliers/suppliers.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { PurchaseOrdersController } from './purchase-orders/purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders/purchase-orders.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [
    InventoryController,
    WarehousesController,
    SuppliersController,
    PurchaseOrdersController,
  ],
  providers: [
    InventoryService,
    WarehousesService,
    SuppliersService,
    PurchaseOrdersService,
    CatalogEventService,
  ],
  exports: [
    InventoryService,
    WarehousesService,
    SuppliersService,
    PurchaseOrdersService,
  ],
})
export class InventoryModule {}
