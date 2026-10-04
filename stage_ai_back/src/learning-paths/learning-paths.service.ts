import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPathEntity } from '../database/entities/learning-path.entity';
import { LearningPathStepEntity } from '../database/entities/learning-path-step.entity';
import { EnrollmentEntity } from '../database/entities/enrollment.entity';
import {
  CreateLearningPathDto,
  UpdateLearningPathStepDto,
} from './dto/create-learning-path.dto';
import { CourseSuggestionsService } from '../course-suggestions/course-suggestions.service';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPathEntity)
    private readonly pathRepo: Repository<LearningPathEntity>,
    @InjectRepository(LearningPathStepEntity)
    private readonly stepRepo: Repository<LearningPathStepEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    private readonly suggestionsService: CourseSuggestionsService,
  ) {}

  /**
   * Enregistre un parcours généré par l'IA.
   * Les étapes sans cours existant génèrent automatiquement une suggestion
   * de cours pour l'administrateur.
   */
  async create(dto: CreateLearningPathDto): Promise<{ path: LearningPathEntity; steps: LearningPathStepEntity[] }> {
    const path = await this.pathRepo.save(
      this.pathRepo.create({
        userId: dto.userId,
        objectifMetier: dto.objectifMetier,
        niveauEvalue: dto.niveauEvalue,
        titre: dto.titre,
        resume: dto.resume,
        modeleIA: dto.modeleIA ?? null,
        statut: 'active',
        createdAt: new Date().toISOString(),
      }),
    );

    const steps: LearningPathStepEntity[] = [];

    for (const stepDto of dto.steps) {
      let suggestionId: string | null = null;

      // Étape non couverte par un cours existant → on suggère sa création à l'admin
      if (!stepDto.courseId) {
        const suggestion = await this.suggestionsService.create({
          titre: stepDto.titre,
          description: stepDto.description,
          category: stepDto.suggestedCourse?.category ?? 'Développement Web',
          level: stepDto.suggestedCourse?.level ?? dto.niveauEvalue,
          competences: stepDto.suggestedCourse?.competences ?? stepDto.competences ?? [],
          justification:
            stepDto.suggestedCourse?.justification ??
            `Étape manquante du parcours « ${dto.titre} » pour l'objectif ${dto.objectifMetier}.`,
          objectifMetier: dto.objectifMetier,
          sourcePathId: path.id,
          demandeurId: dto.userId,
        });
        suggestionId = suggestion.id;
      }

      const step = await this.stepRepo.save(
        this.stepRepo.create({
          pathId: path.id,
          ordre: stepDto.ordre,
          titre: stepDto.titre,
          description: stepDto.description,
          objectif: stepDto.objectif ?? null,
          semaineDebut: stepDto.semaineDebut ?? 1,
          dureeHeures: stepDto.dureeHeures ?? 0,
          statut: 'a_faire',
          courseId: stepDto.courseId ?? null,
          suggestionId,
          competences: stepDto.competences ?? [],
          createdAt: new Date().toISOString(),
        }),
      );
      steps.push(step);
    }

    return { path, steps };
  }

  async findByUser(userId: string): Promise<{ path: LearningPathEntity; steps: LearningPathStepEntity[] }[]> {
    const paths = await this.pathRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      paths.map(async (path) => ({
        path,
        steps: await this.stepRepo.find({ where: { pathId: path.id }, order: { ordre: 'ASC' } }),
      })),
    );
  }

  async findById(id: string): Promise<{ path: LearningPathEntity; steps: LearningPathStepEntity[] }> {
    const path = await this.pathRepo.findOneBy({ id });
    if (!path) throw new NotFoundException('Parcours non trouvé');
    const steps = await this.stepRepo.find({ where: { pathId: id }, order: { ordre: 'ASC' } });
    return { path, steps };
  }

  async updateStep(stepId: string, dto: UpdateLearningPathStepDto): Promise<LearningPathStepEntity> {
    const step = await this.stepRepo.findOneBy({ id: stepId });
    if (!step) throw new NotFoundException('Étape non trouvée');
    if (dto.statut) step.statut = dto.statut;
    return this.stepRepo.save(step);
  }

  /**
   * Inscrit un étudiant au cours d'une étape du parcours.
   */
  async enrollStep(pathId: string, stepId: string, userId: string): Promise<EnrollmentEntity> {
    await this.findById(pathId);
    const step = await this.stepRepo.findOneBy({ id: stepId, pathId });
    if (!step) throw new NotFoundException('Étape non trouvée');
    if (!step.courseId) {
      throw new NotFoundException(
        "Le cours de cette étape est en attente de création par l'administrateur (suggestion IA).",
      );
    }

    const existing = await this.enrollmentRepo.findOneBy({ userId, courseId: step.courseId });
    if (!existing) {
      await this.enrollmentRepo.save(
        this.enrollmentRepo.create({
          userId,
          courseId: step.courseId,
          progress: 0,
          completedLessons: [],
          enrolledAt: new Date().toISOString().split('T')[0],
        }),
      );
    }

    if (step.statut === 'a_faire') {
      step.statut = 'en_cours';
      await this.stepRepo.save(step);
    }

    const enrollment = await this.enrollmentRepo.findOneBy({ userId, courseId: step.courseId });
    return enrollment!;
  }

  async remove(id: string): Promise<void> {
    const path = await this.pathRepo.findOneBy({ id });
    if (!path) throw new NotFoundException('Parcours non trouvé');
    await this.stepRepo.delete({ pathId: id });
    await this.pathRepo.remove(path);
  }
}
