import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [UploadsController],
  providers: [RolesGuard],
})
export class UploadsModule {}
