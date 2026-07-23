import { Module } from '@nestjs/common';

import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';


@Module({
  imports: [

  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
