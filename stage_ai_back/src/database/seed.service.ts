import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PurchaseEntity } from './entities/purchase.entity';
import { StageRequestEntity } from './entities/stage-request.entity';
import { ProgramEntity } from './entities/program.entity';
import { ProgramEnrollmentEntity } from './entities/program-enrollment.entity';
import { LevelEntity } from './entities/level.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepo: Repository<PurchaseEntity>,
    @InjectRepository(StageRequestEntity)
    private readonly stageRequestRepo: Repository<StageRequestEntity>,
    @InjectRepository(ProgramEntity)
    private readonly programRepo: Repository<ProgramEntity>,
    @InjectRepository(ProgramEnrollmentEntity)
    private readonly programEnrollmentRepo: Repository<ProgramEnrollmentEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepo: Repository<LevelEntity>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv !== 'development') {
      this.logger.log('⏭️ Seed skipped: not in development mode');
      return;
    }

    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('⏭️ Seed skipped: database already contains data');
      return;
    }

    this.logger.log('🌱 Starting database seed...');
    await this.seed();
    this.logger.log('✅ Seed completed successfully!');
  }

  async seed() {
    // --------------------------------------------------
    // Seed Users
    // --------------------------------------------------
    const defaultPassword = '12345678';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const usersData = [
      { name: 'Amadou Diallo', email: 'admin@stageia.com', password: hashedPassword, role: 'admin', avatar: 'AD', phone: '+221 77 000 00 01', ville: 'Dakar' },
      { name: 'Fatou Ndiaye', email: 'prof@stageia.com', password: hashedPassword, role: 'professeur', avatar: 'FN', phone: '+221 77 000 00 02', ville: 'Dakar', niveau: 'Bac+5' },
      { name: 'Ibrahima Sow', email: 'etudiant@stageia.com', password: hashedPassword, role: 'etudiant', avatar: 'IS', phone: '+221 77 000 00 03', ville: 'Thiès', niveau: 'Bac+2' },
      { name: 'Mariama Balde', email: 'mariama@stageia.com', password: hashedPassword, role: 'etudiant', avatar: 'MB', ville: 'Conakry', niveau: 'Bac' },
      { name: 'Omar Coulibaly', email: 'omar@stageia.com', password: hashedPassword, role: 'etudiant', avatar: 'OC', ville: 'Abidjan', niveau: 'Bac+3' },
      { name: 'Aissatou Barry', email: 'aissatou@stageia.com', password: hashedPassword, role: 'etudiant', avatar: 'AB', ville: 'Bamako', niveau: 'Bac+2' },
    ];
    const savedUsers = await this.userRepo.save(usersData);

    // Mapping des IDs
    const userIds: Record<string, string> = {
      u1: savedUsers[0].id,
      u2: savedUsers[1].id,
      u3: savedUsers[2].id,
      u4: savedUsers[3].id,
      u5: savedUsers[4].id,
      u6: savedUsers[5].id,
    };

    // --------------------------------------------------
    // Seed Courses
    // --------------------------------------------------
    const coursesData = [
      {
        title: 'Introduction au Développement Web',
        description: 'Apprenez les bases du HTML, CSS et JavaScript pour créer vos premières pages web modernes.',
        category: 'Développement Web', level: 'Débutant', duration: 20, price: 35000,
        professorId: userIds.u2, published: true, thumbnail: '🌐',
        students: [userIds.u3, userIds.u4, userIds.u5],
        createdAt: '2024-01-15',
        modules: [
          { id: 'm1', title: 'Fondamentaux HTML', lessons: [
            { id: 'l1', title: "Structure d'une page HTML", type: 'texte', content: '## Structure HTML\n\nUne page HTML est composée déléments imbriqués.', duration: 15 },
            { id: 'l2', title: 'Les balises essentielles', type: 'video', content: 'Découvrez les balises HTML.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 20 },
            { id: 'l3', title: 'Quiz HTML', type: 'quiz', content: 'Testez vos connaissances.', duration: 10, quiz: [
              { id: 'q1', question: 'Quel élément HTML définit le titre ?', options: ['<title>', '<head>', '<h1>', '<meta>'], correctIndex: 0 },
              { id: 'q2', question: 'Quelle balise crée un lien ?', options: ['<link>', '<a>', '<href>', '<url>'], correctIndex: 1 },
            ]},
          ]},
          { id: 'm2', title: 'CSS Moderne', lessons: [
            { id: 'l4', title: 'Introduction au CSS', type: 'texte', content: '## CSS — Cascading Style Sheets', duration: 15 },
            { id: 'l5', title: 'Exercice : Créer un bouton CSS', type: 'sandbox', content: 'Créez un bouton stylé.', sandboxCode: '<button class="btn">Cliquez-moi</button>\n\n<style>.btn { background-color: #3b3fb8; color: white; padding: 10px 20px; border-radius: 6px; }</style>', duration: 20 },
          ]},
          { id: 'm3', title: 'JavaScript Essentiel', lessons: [
            { id: 'l6', title: 'Variables et types', type: 'texte', content: '## Variables en JavaScript', duration: 15 },
            { id: 'l7', title: 'Sandbox JS', type: 'sandbox', content: 'Pratiquez JavaScript.', sandboxCode: 'function saluer(nom) { return `Bonjour, ${nom} !`; }\nconsole.log(saluer("Ibrahima"));', duration: 25 },
          ]},
        ],
      },
      {
        title: 'Python pour la Data Science',
        description: 'Maîtrisez Python et ses bibliothèques (Pandas, NumPy) pour analyser des données.',
        category: 'Data Science', level: 'Intermédiaire', duration: 35, price: 35000,
        professorId: userIds.u2, published: true, thumbnail: '📊',
        students: [userIds.u3, userIds.u6],
        createdAt: '2024-02-10',
        modules: [
          { id: 'm4', title: 'Python Fondamentaux', lessons: [
            { id: 'l8', title: 'Introduction à Python', type: 'texte', content: '## Python', duration: 20 },
            { id: 'l9', title: 'Quiz Python', type: 'quiz', content: 'Testez vos bases.', duration: 10, quiz: [
              { id: 'q4', question: 'Comment afficher du texte ?', options: ['echo()', 'print()', 'console.log()', 'display()'], correctIndex: 1 },
            ]},
          ]},
          { id: 'm5', title: 'Pandas & Analyse', lessons: [
            { id: 'l10', title: 'Introduction à Pandas', type: 'texte', content: '## Pandas', duration: 25 },
          ]},
        ],
      },
      {
        title: 'UI/UX Design Pratique',
        description: 'Apprenez à concevoir des interfaces modernes avec Figma.',
        category: 'Design', level: 'Débutant', duration: 18, price: 35000,
        professorId: userIds.u2, published: false, thumbnail: '🎨',
        students: [],
        createdAt: '2024-03-05',
        modules: [
          { id: 'm6', title: 'Principes du Design', lessons: [
            { id: 'l11', title: 'Les 4 principes', type: 'texte', content: '## CRAP : Contraste, Répétition, Alignement, Proximité', duration: 20 },
          ]},
        ],
      },
      {
        title: 'Intelligence Artificielle & Machine Learning',
        description: 'Comprenez les fondements du ML avec scikit-learn et TensorFlow.',
        category: 'IA & ML', level: 'Avancé', duration: 45, price: 35000,
        professorId: userIds.u2, published: true, thumbnail: '🤖',
        students: [userIds.u5],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        modules: [
          { id: 'm7', title: 'Fondements du ML', lessons: [
            { id: 'l12', title: "Qu'est-ce que le ML ?", type: 'texte', content: '## Machine Learning', duration: 30 },
          ]},
        ],
      },
    ];
    const savedCourses = await this.courseRepo.save(coursesData);

    // Mapping des IDs de cours
    const courseIds: Record<string, string> = {
      c1: savedCourses[0].id,
      c2: savedCourses[1].id,
      c3: savedCourses[2].id,
      c4: savedCourses[3].id,
    };

    // --------------------------------------------------
    // Seed Enrollments
    // --------------------------------------------------
    const enrollmentsData = [
      { userId: userIds.u3, courseId: courseIds.c1, progress: 68, completedLessons: ['l1', 'l2', 'l3', 'l4'], enrolledAt: '2024-01-20' },
      { userId: userIds.u3, courseId: courseIds.c2, progress: 30, completedLessons: ['l8'], enrolledAt: '2024-02-15' },
      { userId: userIds.u4, courseId: courseIds.c1, progress: 45, completedLessons: ['l1', 'l2', 'l3'], enrolledAt: '2024-01-22' },
      { userId: userIds.u5, courseId: courseIds.c1, progress: 90, completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'], enrolledAt: '2024-01-18' },
      { userId: userIds.u5, courseId: courseIds.c4, progress: 15, completedLessons: ['l12'], enrolledAt: '2024-03-25' },
      { userId: userIds.u6, courseId: courseIds.c2, progress: 55, completedLessons: ['l8', 'l9'], enrolledAt: '2024-02-18' },
    ];
    await this.enrollmentRepo.save(enrollmentsData);

    // --------------------------------------------------
    // Seed Subscription
    // --------------------------------------------------
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 20);
    await this.subscriptionRepo.save({
      userId: userIds.u3,
      plan: 'mensuel',
      status: 'active',
      startDate: '2024-06-01',
      endDate: endDate.toISOString().split('T')[0],
    });

    // --------------------------------------------------
    // Seed Purchases
    // --------------------------------------------------
    await this.purchaseRepo.save([
      { userId: userIds.u5, courseId: courseIds.c1, method: 'orange_money', purchasedAt: '2024-03-10' },
      { userId: userIds.u5, courseId: courseIds.c4, method: 'orange_money', purchasedAt: '2024-03-25' },
    ]);

    // --------------------------------------------------
    // Seed Stage Requests
    // --------------------------------------------------
    await this.stageRequestRepo.save([
      { companyName: 'Orange Sénégal', companyLogo: 'OS', title: 'Stage Développeur Web Front-End', description: 'Rejoignez l\'équipe digitale d\'Orange.', duration: '3 mois', domain: 'Développement Web', status: 'validé', studentId: userIds.u3, submittedAt: '2024-03-01' },
      { companyName: 'Wave Afrique', companyLogo: 'WA', title: 'Stage Data Analyst', description: 'Analysez les données de transactions.', duration: '2 mois', domain: 'Data Science', status: 'en_attente', submittedAt: '2024-03-10' },
      { companyName: 'MTN Côte d\'Ivoire', companyLogo: 'MT', title: 'Stage UI/UX Designer', description: 'Concevez des expériences utilisateur.', duration: '3 mois', domain: 'Design', status: 'en_attente', submittedAt: '2024-03-15' },
      { companyName: 'Jumia Africa', companyLogo: 'JA', title: 'Stage ML Engineer', description: 'Développez des algorithmes de recommandation.', duration: '4 mois', domain: 'IA & ML', status: 'refusé', submittedAt: '2024-02-20' },
    ]);

    // --------------------------------------------------
    // Seed Programs
    // --------------------------------------------------
    const programsData = [
      {
        title: 'Développement Web Full-Stack',
        description: 'Devenez développeur web complet en 6 mois. Maîtrisez HTML, CSS, JavaScript, React, Node.js et les bases de données. Accompagnement personnalisé par un mentor.',
        thumbnail: '🚀',
        duration: 6,
        subscriptionPrice: 15000,
        mentorId: userIds.u2,
        published: true,
        startDate: '2024-09-01',
        endDate: '2025-02-28',
        students: [userIds.u3, userIds.u5],
        createdAt: '2024-08-01',
      },
      {
        title: 'Data Science & Intelligence Artificielle',
        description: 'Un programme intensif de 4 mois pour maîtriser Python, l\'analyse de données, le Machine Learning et le Deep Learning avec un mentor expert.',
        thumbnail: '🤖',
        duration: 4,
        subscriptionPrice: 15000,
        mentorId: userIds.u2,
        published: true,
        startDate: '2024-10-01',
        endDate: '2025-01-31',
        students: [userIds.u3],
        createdAt: '2024-08-15',
      },
      {
        title: 'Design UI/UX & Product Design',
        description: 'Apprenez le design d\'interface et d\'expérience utilisateur en 3 mois. De la recherche utilisateur au prototypage avec Figma, suivi par un mentor designer.',
        thumbnail: '🎨',
        duration: 3,
        subscriptionPrice: 12000,
        mentorId: userIds.u2,
        published: false,
        startDate: '2024-11-01',
        endDate: '2025-01-31',
        students: [],
        createdAt: '2024-09-01',
      },
    ];
    const savedPrograms = await this.programRepo.save(programsData);

    const programIds: Record<string, string> = {
      p1: savedPrograms[0].id,
      p2: savedPrograms[1].id,
      p3: savedPrograms[2].id,
    };

    // --------------------------------------------------
    // Seed Levels
    // --------------------------------------------------
    const levelsData = [
      { programId: programIds.p1, title: 'Fondamentaux du Web', description: 'HTML, CSS et les bases de JavaScript', duration: 30, order: 1, courses: [courseIds.c1] },
      { programId: programIds.p1, title: 'Développement Front-End', description: 'React, TypeScript et frameworks modernes', duration: 45, order: 2, courses: [] },
      { programId: programIds.p1, title: 'Développement Back-End', description: 'Node.js, Express et bases de données', duration: 45, order: 3, courses: [] },
      { programId: programIds.p2, title: 'Fondamentaux Python & Data', description: 'Python, Pandas et analyse de données', duration: 30, order: 1, courses: [courseIds.c2] },
      { programId: programIds.p2, title: 'Machine Learning & IA', description: 'Algorithmes ML, scikit-learn et TensorFlow', duration: 45, order: 2, courses: [courseIds.c4] },
      { programId: programIds.p3, title: 'Design Thinking & UX Research', description: 'Méthodologies de recherche utilisateur', duration: 25, order: 1, courses: [] },
      { programId: programIds.p3, title: 'UI Design avec Figma', description: 'Prototypage et design d\'interface', duration: 35, order: 2, courses: [] },
    ];
    await this.levelRepo.save(levelsData);

    // --------------------------------------------------
    // Seed Program Enrollments
    // --------------------------------------------------
    await this.programEnrollmentRepo.save([
      { userId: userIds.u3, programId: programIds.p1, progress: 35, currentLevelIndex: 0, completedLevels: [], completedCourses: [courseIds.c1], status: 'active', enrolledAt: '2024-09-01' },
      { userId: userIds.u5, programId: programIds.p1, progress: 0, currentLevelIndex: 0, completedLevels: [], completedCourses: [], status: 'active', enrolledAt: '2024-09-05' },
      { userId: userIds.u3, programId: programIds.p2, progress: 0, currentLevelIndex: 0, completedLevels: [], completedCourses: [], status: 'active', enrolledAt: '2024-10-01' },
    ]);
  }
}