import { Module } from '@nestjs/common';

import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';


@Module({
  imports: [

  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
