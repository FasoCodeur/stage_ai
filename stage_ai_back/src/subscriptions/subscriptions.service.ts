import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../database/entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subRepo: Repository<SubscriptionEntity>,
  ) {}

  /**
   * Marque automatiquement comme "expiree" les abonnements actifs
   * dont la date de fin est dépassée.
   */
  private async expireOutdated(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.subRepo
      .createQueryBuilder()
      .update(SubscriptionEntity)
      .set({ status: 'expiree' })
      .where('status = :status AND endDate < :today', { status: 'active', today })
      .execute();
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    await this.expireOutdated();
    return this.subRepo.find();
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity[]> {
    await this.expireOutdated();
    return this.subRepo.findBy({ userId });
  }

  async getActive(userId: string): Promise<SubscriptionEntity | null> {
    await this.expireOutdated();
    return this.subRepo.findOneBy({ userId, status: 'active' });
  }

  async hasAccess(userId: string): Promise<boolean> {
    const sub = await this.getActive(userId);
    if (!sub) return false;
    return new Date(sub.endDate) >= new Date();
  }

  async create(dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    // Si un abonnement actif existe déjà, on le prolonge au lieu d'en créer un nouveau
    const existing = await this.subRepo.findOneBy({ userId: dto.userId, status: 'active' });
    if (existing) {
      return this.extend(existing, 1);
    }

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

  /**
   * Prolonge un abonnement de N mois à partir de sa date de fin
   * (ou d'aujourd'hui si la date de fin est déjà passée).
   */
  private async extend(sub: SubscriptionEntity, months: number): Promise<SubscriptionEntity> {
    const base = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
    base.setMonth(base.getMonth() + months);
    sub.endDate = base.toISOString().split('T')[0];
    sub.status = 'active';
    return this.subRepo.save(sub);
  }

  async update(userId: string, dto: UpdateSubscriptionDto): Promise<SubscriptionEntity> {
    const sub = await this.subRepo.findOneBy({ userId });
    if (!sub) throw new NotFoundException('Abonnement non trouvé');

    if (dto.extendMonths && dto.extendMonths > 0) {
      return this.extend(sub, dto.extendMonths);
    }

    if (dto.status) {
      sub.status = dto.status;
      return this.subRepo.save(sub);
    }

    return sub;
  }

  async cancel(userId: string): Promise<SubscriptionEntity> {
    const sub = await this.subRepo.findOneBy({ userId, status: 'active' });
    if (!sub) throw new NotFoundException('Abonnement actif non trouvé');
    sub.status = 'expiree';
    return this.subRepo.save(sub);
  }
}