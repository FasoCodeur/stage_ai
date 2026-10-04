import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramEntity } from '../database/entities/program.entity';
import { ProgramEnrollmentEntity } from '../database/entities/program-enrollment.entity';
import { LevelEntity } from '../database/entities/level.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { UpdateProgramStepDto } from './dto/update-program-steps.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(ProgramEntity)
    private readonly programRepo: Repository<ProgramEntity>,
    @InjectRepository(ProgramEnrollmentEntity)
    private readonly enrollmentRepo: Repository<ProgramEnrollmentEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepo: Repository<LevelEntity>,
  ) {}

  // ========== PROGRAM CRUD ==========

  async findAll(filter?: ProgramFilterDto): Promise<ProgramEntity[]> {
    const where: any = {};
    if (filter) {
      if (filter.mentorId) where.mentorId = filter.mentorId;
      if (filter.published !== undefined) where.published = filter.published === 'true';
    }
    return this.programRepo.find({ where });
  }

  async findById(id: string): Promise<ProgramEntity> {
    const program = await this.programRepo.findOneBy({ id });
    if (!program) throw new NotFoundException('Programme non trouvé');
    return program;
  }

  async findByStudentId(studentId: string): Promise<ProgramEntity[]> {
    const all = await this.programRepo.find();
    return all.filter(p => p.students?.includes(studentId));
  }

  async findByMentorId(mentorId: string): Promise<ProgramEntity[]> {
    return this.programRepo.findBy({ mentorId });
  }

  async create(dto: CreateProgramDto): Promise<ProgramEntity> {
    const { levels, thumbnail, ...programData } = dto;

    const program = this.programRepo.create({
      ...programData,
      thumbnail: thumbnail || null,
      published: dto.published ?? false,
      students: [],
      createdAt: new Date().toISOString().split('T')[0],
    });
    const saved = await this.programRepo.save(program);
    const created = Array.isArray(saved) ? saved[0] : saved;

    // Création des niveaux dans l'ordre fourni (1, 2, 3...)
    if (levels?.length) {
      const levelEntities = levels.map((level, index) =>
        this.levelRepo.create({
          programId: created.id,
          title: level.title,
          description: level.description || '',
          duration: level.duration,
          order: index + 1,
          courses: level.courses || [],
        }),
      );
      await this.levelRepo.save(levelEntities);
    }

    return created;
  }

  async update(id: string, dto: UpdateProgramDto): Promise<ProgramEntity> {
    const program = await this.findById(id);

    // Garde-fou : on ne publie pas un programme sans contenu
    if (dto.published === true) {
      const levels = await this.levelRepo.find({ where: { programId: id } });
      const hasContent = levels.some((level) => (level.courses?.length ?? 0) > 0);
      if (!hasContent) {
        throw new BadRequestException(
          'Impossible de publier un programme sans au moins une étape contenant des cours.',
        );
      }
    }

    Object.assign(program, dto);
    return this.programRepo.save(program);
  }

  async remove(id: string): Promise<void> {
    const program = await this.findById(id);
    // Remove associated levels and enrollments
    await this.levelRepo.delete({ programId: id });
    await this.enrollmentRepo.delete({ programId: id });
    await this.programRepo.remove(program);
  }

  // ========== LEVEL CRUD ==========

  async getLevels(programId: string): Promise<LevelEntity[]> {
    return this.levelRepo.find({
      where: { programId },
      order: { order: 'ASC' },
    });
  }

  async getLevelById(id: string): Promise<LevelEntity> {
    const level = await this.levelRepo.findOneBy({ id });
    if (!level) throw new NotFoundException('Niveau non trouvé');
    return level;
  }

  async createLevel(programId: string, data: { title: string; description?: string; duration: number; courses?: string[] }): Promise<LevelEntity> {
    // Verify program exists
    await this.findById(programId);

    // Get current max order
    const existingLevels = await this.levelRepo.find({
      where: { programId },
      order: { order: 'DESC' },
      take: 1,
    });
    const nextOrder = existingLevels.length > 0 ? existingLevels[0].order + 1 : 1;

    const level = this.levelRepo.create({
      programId,
      title: data.title,
      description: data.description || '',
      duration: data.duration,
      order: nextOrder,
      courses: data.courses || [],
    });
    return this.levelRepo.save(level);
  }

  async updateLevel(id: string, data: Partial<{ title: string; description: string; duration: number; courses: string[] }>): Promise<LevelEntity> {
    const level = await this.getLevelById(id);
    Object.assign(level, data);
    return this.levelRepo.save(level);
  }

  async removeLevel(id: string): Promise<void> {
    const level = await this.getLevelById(id);
    await this.levelRepo.remove(level);
  }

  /**
   * Remplace le parcours d'un programme par la liste fournie.
   * Les étapes existantes conservent leur identifiant (la progression des
   * étudiants reste valable), les nouvelles sont créées, les absentes sont
   * supprimées et l'ordre est renuméroté de 1 à n.
   */
  async replaceSteps(
    programId: string,
    steps: UpdateProgramStepDto[],
  ): Promise<LevelEntity[]> {
    await this.findById(programId);

    const existingLevels = await this.levelRepo.find({
      where: { programId },
      order: { order: 'ASC' },
    });
    const existingById = new Map(existingLevels.map((level) => [level.id, level]));

    const keptIds = new Set<string>();
    const savedLevels: LevelEntity[] = [];

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      const existing = step.id ? existingById.get(step.id) : undefined;

      if (existing) {
        existing.title = step.title;
        existing.description = step.description ?? '';
        existing.duration = step.duration;
        existing.order = index + 1;
        existing.courses = step.courses ?? [];
        const saved = await this.levelRepo.save(existing);
        keptIds.add(saved.id);
        savedLevels.push(saved);
      } else {
        const created = await this.levelRepo.save(
          this.levelRepo.create({
            programId,
            title: step.title,
            description: step.description ?? '',
            duration: step.duration,
            order: index + 1,
            courses: step.courses ?? [],
          }),
        );
        keptIds.add(created.id);
        savedLevels.push(created);
      }
    }

    // Étapes retirées du parcours : on les supprime et on nettoie les progressions
    const removedIds = existingLevels
      .filter((level) => !keptIds.has(level.id))
      .map((level) => level.id);

    if (removedIds.length > 0) {
      await this.levelRepo.delete(removedIds);

      const ordered = [...savedLevels].sort((a, b) => a.order - b.order);
      const enrollments = await this.enrollmentRepo.findBy({ programId });

      for (const enrollment of enrollments) {
        const completedLevels = (enrollment.completedLevels || []).filter(
          (levelId) => !removedIds.includes(levelId),
        );
        const currentLevelIndex = ordered.findIndex(
          (level) => !completedLevels.includes(level.id),
        );

        enrollment.completedLevels = completedLevels;
        enrollment.currentLevelIndex =
          currentLevelIndex === -1 ? Math.max(ordered.length - 1, 0) : currentLevelIndex;
        enrollment.progress =
          ordered.length > 0
            ? Math.round((completedLevels.length / ordered.length) * 100)
            : 0;

        await this.enrollmentRepo.save(enrollment);
      }
    }

    return savedLevels.sort((a, b) => a.order - b.order);
  }

  // ========== ENROLLMENT ==========

  async enrollStudent(programId: string, userId: string): Promise<ProgramEnrollmentEntity> {
    const program = await this.findById(programId);

    // Check if program is still active (within date range)
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    if (now < startDate) {
      throw new BadRequestException("Le programme n'a pas encore commencé");
    }
    if (now > endDate) {
      throw new BadRequestException("Le programme est terminé, les inscriptions sont closes");
    }

    // Check if already enrolled
    const existing = await this.enrollmentRepo.findOneBy({ userId, programId });
    if (existing) {
      throw new BadRequestException('Vous êtes déjà inscrit à ce programme');
    }

    // Add student to program's students list
    if (!program.students?.includes(userId)) {
      program.students = [...(program.students || []), userId];
      await this.programRepo.save(program);
    }

    // Create enrollment record (starts at level index 0 = first level)
    const enrollment = this.enrollmentRepo.create({
      userId,
      programId,
      progress: 0,
      currentLevelIndex: 0,
      completedLevels: [],
      completedCourses: [],
      status: 'active',
      enrolledAt: new Date().toISOString().split('T')[0],
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async getEnrollments(programId: string): Promise<ProgramEnrollmentEntity[]> {
    return this.enrollmentRepo.findBy({ programId });
  }

  async getStudentEnrollments(userId: string): Promise<ProgramEnrollmentEntity[]> {
    return this.enrollmentRepo.findBy({ userId });
  }

  // ========== LEVEL VALIDATION & PROGRESSION ==========

  /**
   * Validate a level: mark a course as completed for a student
   * Returns the updated enrollment
   */
  async completeCourse(
    programId: string,
    userId: string,
    courseId: string,
  ): Promise<ProgramEnrollmentEntity> {
    const enrollment = await this.enrollmentRepo.findOneBy({ userId, programId });
    if (!enrollment) throw new NotFoundException('Inscription au programme non trouvée');

    if (enrollment.status !== 'active') {
      throw new BadRequestException(`Inscription ${enrollment.status}, impossible de continuer`);
    }

    // Check if program is still active
    const program = await this.findById(programId);
    const now = new Date();
    if (now > new Date(program.endDate)) {
      enrollment.status = 'expired';
      await this.enrollmentRepo.save(enrollment);
      throw new BadRequestException('Le programme est terminé');
    }

    // Add course to completed courses if not already there
    if (!enrollment.completedCourses.includes(courseId)) {
      enrollment.completedCourses = [...enrollment.completedCourses, courseId];
    }

    // Check if current level is fully completed
    const levels = await this.levelRepo.find({
      where: { programId },
      order: { order: 'ASC' },
    });
    const currentLevel = levels[enrollment.currentLevelIndex];
    if (currentLevel) {
      const allCoursesCompleted = currentLevel.courses.every(
        (cid) => enrollment.completedCourses.includes(cid),
      );
      if (allCoursesCompleted) {
        // Mark level as completed
        if (!enrollment.completedLevels.includes(currentLevel.id)) {
          enrollment.completedLevels = [...enrollment.completedLevels, currentLevel.id];
        }
        // Advance to next level if available
        if (enrollment.currentLevelIndex < levels.length - 1) {
          enrollment.currentLevelIndex += 1;
        } else {
          // All levels completed
          enrollment.status = 'completed';
          enrollment.progress = 100;
        }
      }
    }

    // Calculate overall progress
    const totalLevels = levels.length;
    if (totalLevels > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLevels.length / totalLevels) * 100,
      );
    }

    return this.enrollmentRepo.save(enrollment);
  }

  /**
   * Update mentor notes for a student enrollment
   */
  async updateMentorNotes(
    programId: string,
    userId: string,
    mentorNotes: string,
  ): Promise<ProgramEnrollmentEntity> {
    const enrollment = await this.enrollmentRepo.findOneBy({ userId, programId });
    if (!enrollment) throw new NotFoundException('Inscription au programme non trouvée');
    enrollment.mentorNotes = mentorNotes;
    return this.enrollmentRepo.save(enrollment);
  }

  /**
   * Check if program is expired (end date passed)
   */
  async isProgramExpired(programId: string): Promise<boolean> {
    const program = await this.findById(programId);
    return new Date() > new Date(program.endDate);
  }

  /**
   * Get current level info for a student enrollment
   */
  async getCurrentLevel(programId: string, userId: string): Promise<{ enrollment: ProgramEnrollmentEntity; currentLevel: LevelEntity | null; nextLevel: LevelEntity | null; levels: LevelEntity[] }> {
    const enrollment = await this.enrollmentRepo.findOneBy({ userId, programId });
    if (!enrollment) throw new NotFoundException('Inscription au programme non trouvée');

    const levels = await this.levelRepo.find({
      where: { programId },
      order: { order: 'ASC' },
    });

    const currentLevel = levels[enrollment.currentLevelIndex] || null;
    const nextLevel = levels[enrollment.currentLevelIndex + 1] || null;

    return { enrollment, currentLevel, nextLevel, levels };
  }
}