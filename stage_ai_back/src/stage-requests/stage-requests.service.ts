import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageRequestEntity } from '../database/entities/stage-request.entity';
import { CreateStageRequestDto } from './dto/create-stage-request.dto';
import { StageStatus } from '../common/enums/status.enum';

@Injectable()
export class StageRequestsService {
  constructor(
    @InjectRepository(StageRequestEntity)
    private readonly stageRepo: Repository<StageRequestEntity>,
  ) {}

  findAll(): Promise<StageRequestEntity[]> {
    return this.stageRepo.find();
  }

  async findById(id: string): Promise<StageRequestEntity> {
    const req = await this.stageRepo.findOneBy({ id });
    if (!req) throw new NotFoundException('Demande de stage non trouvée');
    return req;
  }

  findByStudentId(studentId: string): Promise<StageRequestEntity[]> {
    return this.stageRepo.findBy({ studentId });
  }

  findByStatus(status: string): Promise<StageRequestEntity[]> {
    return this.stageRepo.findBy({ status });
  }

  async create(dto: CreateStageRequestDto): Promise<StageRequestEntity> {
    const request = this.stageRepo.create({
      ...dto,
      status: dto.status ?? StageStatus.EN_ATTENTE,
      submittedAt: new Date().toISOString().split('T')[0],
    });
    return this.stageRepo.save(request);
  }

  async updateStatus(id: string, status: StageStatus): Promise<StageRequestEntity> {
    const req = await this.findById(id);
    req.status = status;
    return this.stageRepo.save(req);
  }

  async remove(id: string): Promise<void> {
    const req = await this.findById(id);
    await this.stageRepo.remove(req);
  }
}