import { Module } from '@nestjs/common';

import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';


@Module({
  imports: [

  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
