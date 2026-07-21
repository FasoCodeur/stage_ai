import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PurchaseEntity } from '../database/entities/purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseEntity])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}