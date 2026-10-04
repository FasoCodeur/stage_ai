import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidatureEntity } from '../database/entities/candidature.entity';
import { OffreEntity } from '../database/entities/offre.entity';
import { StageEntity } from '../database/entities/stage.entity';
import { NotificationEntity } from '../database/entities/notification.entity';
import { CreateCandidatureDto } from './dto/create-candidature.dto';

@Injectable()
export class CandidaturesService {
  constructor(
    @InjectRepository(CandidatureEntity)
    private readonly candidatureRepo: Repository<CandidatureEntity>,
    @InjectRepository(OffreEntity)
    private readonly offreRepo: Repository<OffreEntity>,
    @InjectRepository(StageEntity)
    private readonly stageRepo: Repository<StageEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  findAll(): Promise<CandidatureEntity[]> {
    return this.candidatureRepo.find({ order: { createdAt: 'DESC' } });
  }

  findByOffre(offreId: string): Promise<CandidatureEntity[]> {
    return this.candidatureRepo.findBy({ offreId });
  }

  findByEtudiant(etudiantId: string): Promise<CandidatureEntity[]> {
    return this.candidatureRepo.findBy({ etudiantId });
  }

  async findById(id: string): Promise<CandidatureEntity> {
    const cand = await this.candidatureRepo.findOneBy({ id });
    if (!cand) throw new NotFoundException('Candidature non trouvée');
    return cand;
  }

  async create(dto: CreateCandidatureDto): Promise<CandidatureEntity> {
    const offre = await this.offreRepo.findOneBy({ id: dto.offreId });
    if (!offre) throw new NotFoundException('Offre non trouvée');
    if (offre.statut !== 'validee') {
      throw new BadRequestException('Offre non valide pour une candidature');
    }
    const existing = await this.candidatureRepo.findOneBy({
      offreId: dto.offreId,
      etudiantId: dto.etudiantId,
    });
    if (existing) throw new BadRequestException('Candidature déjà existante');

    const cand = this.candidatureRepo.create({
      ...dto,
      statut: 'en_attente',
    });
    return this.candidatureRepo.save(cand);
  }

  async updateStatut(id: string, statut: string, mentorId?: string): Promise<CandidatureEntity> {
    const cand = await this.findById(id);
    if (statut === 'validee') {
      await this.creerStage(cand, mentorId);
    }
    cand.statut = statut;
    return this.candidatureRepo.save(cand);
  }

  private async creerStage(cand: CandidatureEntity, mentorId?: string): Promise<StageEntity> {
    const offre = await this.offreRepo.findOneBy({ id: cand.offreId });
    if (!offre) throw new NotFoundException('Offre non trouvée');

    const dateDebut = new Date();
    const dureeMois = parseInt(offre.duree, 10) || 3;
    const dateFin = new Date(dateDebut);
    dateFin.setMonth(dateFin.getMonth() + dureeMois);

    // Évite la duplication de stage pour la même candidature
    const existingStage = await this.stageRepo.findOneBy({ offreId: cand.offreId });
    if (!existingStage) {
      const stage = this.stageRepo.create({
        offreId: cand.offreId,
        etudiantId: cand.etudiantId,
        entrepriseId: offre.entrepriseId,
        mentorId: mentorId ?? offre.mentorId,
        statut: 'actif',
        dateDebut: dateDebut.toISOString().split('T')[0],
        dateFin: dateFin.toISOString().split('T')[0],
        progression: 0,
        scorePerformance: 0,
        domainData: offre.domainData,
      });
      const saved = await this.stageRepo.save(stage);

      // Notifications aux 3 acteurs
      await this.notifier('stage_cree', saved.id, [
        { destinataireId: saved.etudiantId, titre: 'Stage créé', contenu: `Votre stage "${offre.titre}" est actif !` },
        { destinataireId: saved.entrepriseId, titre: 'Nouveau stagiaire', contenu: `Un stagiaire a été assigné à "${offre.titre}".` },
        ...(saved.mentorId ? [{ destinataireId: saved.mentorId, titre: 'Stage assigné', contenu: `Vous êtes mentor sur le stage "${offre.titre}".` }] : []),
      ]);
      return saved;
    }
    return existingStage;
  }

  private async notifier(type: string, stageId: string, items: { destinataireId: string; titre: string; contenu: string }[]) {
    for (const item of items) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          destinataireId: item.destinataireId,
          type: 'in_app',
          titre: item.titre,
          contenu: item.contenu,
          stageId,
          lu: false,
        }),
      );
    }
  }

  async remove(id: string): Promise<void> {
    const cand = await this.findById(id);
    await this.candidatureRepo.remove(cand);
  }
}