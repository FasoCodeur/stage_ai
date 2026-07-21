import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../database/entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subRepo: Repository<SubscriptionEntity>,
  ) {}

  findAll(): Promise<SubscriptionEntity[]> {
    return this.subRepo.find();
  }

  findByUserId(userId: string): Promise<SubscriptionEntity[]> {
    return this.subRepo.findBy({ userId });
  }

  async getActive(userId: string): Promise<SubscriptionEntity | null> {
    return this.subRepo.findOneBy({ userId, status: 'active' });
  }

  async hasAccess(userId: string): Promise<boolean> {
    const sub = await this.getActive(userId);
    if (!sub) return false;
    return new Date(sub.endDate) >= new Date();
  }

  async create(dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    const sub = this.subRepo.create({
      userId: dto.userId,
      plan: dto.plan,
      status: dto.status ?? 'active',
      startDate: now.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    return this.subRepo.save(sub);
  }

  async cancel(userId: string): Promise<SubscriptionEntity> {
    const sub = await this.subRepo.findOneBy({ userId, status: 'active' });
    if (!sub) throw new NotFoundException('Abonnement actif non trouvé');
    sub.status = 'expiree';
    return this.subRepo.save(sub);
  }
}