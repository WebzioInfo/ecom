import { Module } from '@nestjs/common';
import { StringValue } from 'ms';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SuperAdminsModule } from '../super-admins/super-admins.module';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminAuthController } from './super-admin-auth.controller';
import { SuperAdminJwtStrategy } from './strategies/super-admin-jwt.strategy';

@Module({
  imports: [
    SuperAdminsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET')!, // guaranteed string at runtime
        signOptions: {
          // Cast to acceptable type (StringValue)
          expiresIn: configService.get<string>(
            'JWT_ACCESS_EXPIRES',
          ) as unknown as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SuperAdminAuthController],
  providers: [SuperAdminAuthService, SuperAdminJwtStrategy],
  exports: [SuperAdminAuthService],
})
export class SuperAdminAuthModule {}
