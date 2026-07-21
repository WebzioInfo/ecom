import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StoresModule } from './modules/stores/stores.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { StorefrontApiModule } from './modules/storefront-api/storefront-api.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SuperAdminsModule } from './modules/super-admins/super-admins.module';
import { SuperAdminAuthModule } from './modules/super-admin-auth/super-admin-auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PlansModule } from './modules/plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    SuperAdminsModule,
    SuperAdminAuthModule,
    ProductsModule,
    OrdersModule,
    StoresModule,
    ApiKeysModule,
    CustomersModule,
    InventoryModule,
    MarketingModule,
    AuditLogsModule,
    StorefrontApiModule,
    UploadsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    PlansModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
