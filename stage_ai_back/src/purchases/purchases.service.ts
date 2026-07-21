import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseEntity } from '../database/entities/purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepo: Repository<PurchaseEntity>,
  ) {}

  findAll(): Promise<PurchaseEntity[]> {
    return this.purchaseRepo.find();
  }

  findByUserId(userId: string): Promise<PurchaseEntity[]> {
    return this.purchaseRepo.findBy({ userId });
  }

  async hasPurchased(userId: string, courseId: string): Promise<boolean> {
    const count = await this.purchaseRepo.countBy({ userId, courseId });
    return count > 0;
  }

  async create(dto: CreatePurchaseDto): Promise<PurchaseEntity> {
    const purchase = this.purchaseRepo.create({
      ...dto,
      purchasedAt: new Date().toISOString().split('T')[0],
    });
    return this.purchaseRepo.save(purchase);
  }
}