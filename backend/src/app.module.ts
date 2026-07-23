import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { SuperAdminsModule } from './modules/super-admins/super-admins.module';
import { SuperAdminAuthModule } from './modules/super-admin-auth/super-admin-auth.module';
import { StoresModule } from './modules/stores/stores.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { StorefrontApiModule } from './modules/storefront-api/storefront-api.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PlansModule } from './modules/plans/plans.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    SuperAdminsModule,
    SuperAdminAuthModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    StoresModule,
    ApiKeysModule,
    CustomersModule,
    InventoryModule,
    MarketingModule,
    AuditLogsModule,
    StorefrontApiModule,
    UploadsModule,
    PlansModule,
    SupportModule,
    NotificationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
