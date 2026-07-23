import { Module } from '@nestjs/common';


import { SuperAdminsService } from './super-admins.service';
import { SuperAdminSeederService } from './super-admin-seeder.service';

@Module({
  imports: [
    
  ],
  providers: [SuperAdminsService, SuperAdminSeederService],
  exports: [SuperAdminsService],
})
export class SuperAdminsModule {}
