import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { BillingModule } from './modules/billing/billing.module';
import { PlatformDashboardModule } from './modules/platform-dashboard/platform-dashboard.module';
import { TenantMonitoringModule } from './modules/tenant-monitoring/tenant-monitoring.module';
import { SystemMonitoringModule } from './modules/system-monitoring/system-monitoring.module';
import { AutomationModule } from './modules/automation/automation.module';
import { PlatformReportsModule } from './modules/platform-reports/platform-reports.module';
import { TenantReportsModule } from './modules/tenant-reports/tenant-reports.module';
import { ExportEngineModule } from './modules/export-engine/export-engine.module';

import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { TenantResolverService } from './common/tenant/tenant-resolver.service';
import { BootstrapCheckerService } from './common/bootstrap/bootstrap-checker.service';
import { CatalogEventModule } from './modules/products/events/catalog-event.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ScheduleModule } from '@nestjs/schedule';

import { TeamModule } from './modules/team/team.module';

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
    WishlistModule,
    PaymentsModule,
    ShipmentsModule,
    InvoicesModule,
    SubscriptionsModule,
    BillingModule,
    PlatformDashboardModule,
    TenantMonitoringModule,
    SystemMonitoringModule,
    AutomationModule,
    PlatformReportsModule,
    TenantReportsModule,
    ExportEngineModule,
    CatalogEventModule,
    TeamModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    TenantResolverService,
    BootstrapCheckerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
