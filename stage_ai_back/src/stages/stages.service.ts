import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageEntity } from '../database/entities/stage.entity';
import { MissionEntity } from '../database/entities/mission.entity';
import { TacheEntity } from '../database/entities/tache.entity';
import { TempsTravailEntity } from '../database/entities/temps-travail.entity';
import { LivrableEntity } from '../database/entities/livrable.entity';
import { ReunionEntity } from '../database/entities/reunion.entity';
import { MessageEntity } from '../database/entities/message.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(StageEntity)
    private readonly stageRepo: Repository<StageEntity>,
    @InjectRepository(MissionEntity)
    private readonly missionRepo: Repository<MissionEntity>,
    @InjectRepository(TacheEntity)
    private readonly tacheRepo: Repository<TacheEntity>,
    @InjectRepository(TempsTravailEntity)
    private readonly tempsRepo: Repository<TempsTravailEntity>,
    @InjectRepository(LivrableEntity)
    private readonly livrableRepo: Repository<LivrableEntity>,
    @InjectRepository(ReunionEntity)
    private readonly reunionRepo: Repository<ReunionEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  findAll(): Promise<StageEntity[]> {
    return this.stageRepo.find({ order: { createdAt: 'DESC' } });
  }

  findByEtudiant(etudiantId: string): Promise<StageEntity[]> {
    return this.stageRepo.findBy({ etudiantId });
  }

  findByMentor(mentorId: string): Promise<StageEntity[]> {
    return this.stageRepo.findBy({ mentorId });
  }

  findByEntreprise(entrepriseId: string): Promise<StageEntity[]> {
    return this.stageRepo.findBy({ entrepriseId });
  }

  async findById(id: string): Promise<StageEntity> {
    const stage = await this.stageRepo.findOneBy({ id });
    if (!stage) throw new NotFoundException('Stage non trouvé');
    return stage;
  }

  // Dashboard : mission courante + tâches + stats
  async getDashboard(id: string) {
    const stage = await this.findById(id);

    const missions = await this.missionRepo.find({
      where: { stageId: id },
      order: { createdAt: 'ASC' },
    });
    const missionCourante = missions.find((m) => m.statut !== 'termine') ?? missions[0] ?? null;

    let taches: TacheEntity[] = [];
    if (missionCourante) {
      taches = await this.tacheRepo.find({
        where: { missionId: missionCourante.id },
        order: { ordre: 'ASC' },
      });
    }
    const tachesTerminees = taches.filter((t) => t.statut === 'termine').length;
    const progression = taches.length ? Math.round((tachesTerminees / taches.length) * 100) : stage.progression;

    const temps = await this.tempsRepo.find({ where: { stageId: id } });
    const heuresSemaine = temps.reduce((acc, t) => acc + t.dureeMinutes, 0) / 60;

    // Aucune mission : on évite d'interroger les livrables avec un identifiant vide (colonne uuid)
    const livrables = missionCourante
      ? await this.livrableRepo.findBy({ missionId: missionCourante.id })
      : [];
    const reunions = await this.reunionRepo.find({
      where: { stageId: id },
      order: { dateReunion: 'ASC' },
    });

    return {
      ...stage,
      progression,
      missionCourante,
      taches,
      heuresSemaine: Math.round(heuresSemaine * 10) / 10,
      scorePerformance: stage.scorePerformance,
      livrables,
      reunions,
    };
  }

  async create(donnees: Partial<StageEntity>): Promise<StageEntity> {
    const stage = this.stageRepo.create(donnees);
    return this.stageRepo.save(stage);
  }

  async update(id: string, dto: Partial<StageEntity>): Promise<StageEntity> {
    const stage = await this.findById(id);
    Object.assign(stage, dto);
    return this.stageRepo.save(stage);
  }

  async getMessages(stageId: string): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: { stageId },
      order: { createdAt: 'ASC' },
    });
  }

  async envoyerMessage(stageId: string, expediteurId: string, contenu: string): Promise<MessageEntity> {
    const stage = await this.findById(stageId);
    return this.messageRepo.save(
      this.messageRepo.create({ stageId: stage.id, expediteurId, contenu }),
    );
  }
}