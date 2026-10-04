import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSuggestionEntity } from '../database/entities/course-suggestion.entity';
import { UserEntity } from '../database/entities/user.entity';
import { CreateCourseSuggestionDto } from './dto/create-course-suggestion.dto';
import { ReviewCourseSuggestionDto } from './dto/review-course-suggestion.dto';
import { MailerService } from '../common/mailer/mailer.service';

@Injectable()
export class CourseSuggestionsService {
  constructor(
    @InjectRepository(CourseSuggestionEntity)
    private readonly suggestionRepo: Repository<CourseSuggestionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mailerService: MailerService,
  ) {}

  findAll(statut?: string): Promise<CourseSuggestionEntity[]> {
    const where = statut ? { statut } : {};
    return this.suggestionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<CourseSuggestionEntity> {
    const suggestion = await this.suggestionRepo.findOneBy({ id });
    if (!suggestion) throw new NotFoundException('Suggestion non trouvée');
    return suggestion;
  }

  /**
   * Crée une suggestion de cours. Si une suggestion identique est déjà en attente,
   * on renvoie l'existante (évite les doublons générés par l'IA).
   */
  async create(dto: CreateCourseSuggestionDto): Promise<CourseSuggestionEntity> {
    const existing = await this.suggestionRepo.find({ where: { statut: 'en_attente' } });
    const duplicate = existing.find(
      (s) => s.titre.trim().toLowerCase() === dto.titre.trim().toLowerCase(),
    );
    if (duplicate) return duplicate;

    const suggestion = this.suggestionRepo.create({
      titre: dto.titre.trim(),
      description: dto.description,
      category: dto.category,
      level: dto.level,
      competences: dto.competences ?? [],
      justification: dto.justification,
      objectifMetier: dto.objectifMetier ?? null,
      sourcePathId: dto.sourcePathId ?? null,
      demandeurId: dto.demandeurId ?? null,
      statut: 'en_attente',
      createdAt: new Date().toISOString(),
    });

    const saved = await this.suggestionRepo.save(suggestion);
    await this.notifyAdmins(saved);
    return saved;
  }

  /** Notifie les administrateurs (in-app + email) d'une nouvelle suggestion. */
  private async notifyAdmins(suggestion: CourseSuggestionEntity): Promise<void> {
    try {
      const admins = await this.userRepo.findBy({ role: 'admin' });
      for (const admin of admins) {
        await this.mailerService.sendCourseSuggestion(admin.email, admin.name, {
          titre: suggestion.titre,
          category: suggestion.category,
          level: suggestion.level,
          justification: suggestion.justification,
          competences: suggestion.competences,
        });
      }
    } catch {
      // Ne bloque jamais la création si la notification échoue
    }
  }

  /** Marque la suggestion comme acceptée (un cours a été créé). */
  async accept(id: string, dto: ReviewCourseSuggestionDto, reviewedBy?: string): Promise<CourseSuggestionEntity> {
    const suggestion = await this.findById(id);
    suggestion.statut = 'acceptee';
    suggestion.courseId = dto.courseId ?? suggestion.courseId ?? null;
    suggestion.reviewedBy = reviewedBy ?? null;
    return this.suggestionRepo.save(suggestion);
  }

  /** Marque la suggestion comme refusée avec un motif. */
  async reject(id: string, dto: ReviewCourseSuggestionDto, reviewedBy?: string): Promise<CourseSuggestionEntity> {
    const suggestion = await this.findById(id);
    suggestion.statut = 'refusee';
    suggestion.motifRefus = dto.motif ?? null;
    suggestion.reviewedBy = reviewedBy ?? null;
    return this.suggestionRepo.save(suggestion);
  }

  async remove(id: string): Promise<void> {
    const suggestion = await this.findById(id);
    await this.suggestionRepo.remove(suggestion);
  }

  async countPending(): Promise<number> {
    return this.suggestionRepo.countBy({ statut: 'en_attente' });
  }
}
