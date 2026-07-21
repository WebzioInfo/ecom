import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { Coupon, CouponSchema } from './schemas/coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService, MongooseModule],
})
export class MarketingModule {}
