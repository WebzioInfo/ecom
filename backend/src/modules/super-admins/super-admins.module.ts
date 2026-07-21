import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdmin, SuperAdminSchema } from './schemas/super-admin.schema';
import { SuperAdminsService } from './super-admins.service';
import { SuperAdminSeederService } from './super-admin-seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SuperAdmin.name, schema: SuperAdminSchema },
    ]),
  ],
  providers: [SuperAdminsService, SuperAdminSeederService],
  exports: [SuperAdminsService],
})
export class SuperAdminsModule {}
