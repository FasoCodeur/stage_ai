import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PurchaseEntity } from './entities/purchase.entity';
import { StageRequestEntity } from './entities/stage-request.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  const courseRepo = app.get<Repository<CourseEntity>>(getRepositoryToken(CourseEntity));
  const enrollmentRepo = app.get<Repository<EnrollmentEntity>>(getRepositoryToken(EnrollmentEntity));
  const subscriptionRepo = app.get<Repository<SubscriptionEntity>>(getRepositoryToken(SubscriptionEntity));
  const purchaseRepo = app.get<Repository<PurchaseEntity>>(getRepositoryToken(PurchaseEntity));
  const stageRequestRepo = app.get<Repository<StageRequestEntity>>(getRepositoryToken(StageRequestEntity));

  // Clear existing data
  await Promise.all([
    userRepo.delete({}),
    courseRepo.delete({}),
    enrollmentRepo.delete({}),
    subscriptionRepo.delete({}),
    purchaseRepo.delete({}),
    stageRequestRepo.delete({}),
  ]);

  // Seed Users
  const users = [
    { id: 'u1', name: 'Amadou Diallo', email: 'admin@stageia.com', password: 'admin123', role: 'admin', avatar: 'AD', phone: '+221 77 000 00 01', ville: 'Dakar' },
    { id: 'u2', name: 'Fatou Ndiaye', email: 'prof@stageia.com', password: 'prof123', role: 'professeur', avatar: 'FN', phone: '+221 77 000 00 02', ville: 'Dakar', niveau: 'Bac+5' },
    { id: 'u3', name: 'Ibrahima Sow', email: 'etudiant@stageia.com', password: 'etudiant123', role: 'etudiant', avatar: 'IS', phone: '+221 77 000 00 03', ville: 'Thiès', niveau: 'Bac+2' },
    { id: 'u4', name: 'Mariama Balde', email: 'mariama@stageia.com', password: 'etudiant123', role: 'etudiant', avatar: 'MB', ville: 'Conakry', niveau: 'Bac' },
    { id: 'u5', name: 'Omar Coulibaly', email: 'omar@stageia.com', password: 'etudiant123', role: 'etudiant', avatar: 'OC', ville: 'Abidjan', niveau: 'Bac+3' },
    { id: 'u6', name: 'Aissatou Barry', email: 'aissatou@stageia.com', password: 'etudiant123', role: 'etudiant', avatar: 'AB', ville: 'Bamako', niveau: 'Bac+2' },
  ];
  await userRepo.save(users);

  // Seed Courses
  const courses = [
    {
      id: 'c1', title: 'Introduction au Développement Web',
      description: 'Apprenez les bases du HTML, CSS et JavaScript pour créer vos premières pages web modernes.',
      category: 'Développement Web', level: 'Débutant', duration: 20, price: 35000,
      professorId: 'u2', published: true, thumbnail: '🌐',
      students: ['u3', 'u4', 'u5'],
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
      id: 'c2', title: 'Python pour la Data Science',
      description: 'Maîtrisez Python et ses bibliothèques (Pandas, NumPy) pour analyser des données.',
      category: 'Data Science', level: 'Intermédiaire', duration: 35, price: 35000,
      professorId: 'u2', published: true, thumbnail: '📊',
      students: ['u3', 'u6'],
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
      id: 'c3', title: 'UI/UX Design Pratique',
      description: 'Apprenez à concevoir des interfaces modernes avec Figma.',
      category: 'Design', level: 'Débutant', duration: 18, price: 35000,
      professorId: 'u2', published: false, thumbnail: '🎨',
      students: [],
      createdAt: '2024-03-05',
      modules: [
        { id: 'm6', title: 'Principes du Design', lessons: [
          { id: 'l11', title: 'Les 4 principes', type: 'texte', content: '## CRAP : Contraste, Répétition, Alignement, Proximité', duration: 20 },
        ]},
      ],
    },
    {
      id: 'c4', title: 'Intelligence Artificielle & Machine Learning',
      description: 'Comprenez les fondements du ML avec scikit-learn et TensorFlow.',
      category: 'IA & ML', level: 'Avancé', duration: 45, price: 35000,
      professorId: 'u2', published: true, thumbnail: '🤖',
      students: ['u5'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      modules: [
        { id: 'm7', title: 'Fondements du ML', lessons: [
          { id: 'l12', title: "Qu'est-ce que le ML ?", type: 'texte', content: '## Machine Learning', duration: 30 },
        ]},
      ],
    },
  ];
  await courseRepo.save(courses);

  // Seed Enrollments
  const enrollments = [
    { userId: 'u3', courseId: 'c1', progress: 68, completedLessons: ['l1', 'l2', 'l3', 'l4'], enrolledAt: '2024-01-20' },
    { userId: 'u3', courseId: 'c2', progress: 30, completedLessons: ['l8'], enrolledAt: '2024-02-15' },
    { userId: 'u4', courseId: 'c1', progress: 45, completedLessons: ['l1', 'l2', 'l3'], enrolledAt: '2024-01-22' },
    { userId: 'u5', courseId: 'c1', progress: 90, completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'], enrolledAt: '2024-01-18' },
    { userId: 'u5', courseId: 'c4', progress: 15, completedLessons: ['l12'], enrolledAt: '2024-03-25' },
    { userId: 'u6', courseId: 'c2', progress: 55, completedLessons: ['l8', 'l9'], enrolledAt: '2024-02-18' },
  ];
  await enrollmentRepo.save(enrollments);

  // Seed Subscription
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 20);
  await subscriptionRepo.save({
    userId: 'u3',
    plan: 'mensuel',
    status: 'active',
    startDate: '2024-06-01',
    endDate: endDate.toISOString().split('T')[0],
  });

  // Seed Purchases
  await purchaseRepo.save([
    { userId: 'u5', courseId: 'c1', method: 'orange_money', purchasedAt: '2024-03-10' },
    { userId: 'u5', courseId: 'c4', method: 'orange_money', purchasedAt: '2024-03-25' },
  ]);

  // Seed Stage Requests
  await stageRequestRepo.save([
    { id: 's1', companyName: 'Orange Sénégal', companyLogo: 'OS', title: 'Stage Développeur Web Front-End', description: 'Rejoignez l\'équipe digitale d\'Orange.', duration: '3 mois', domain: 'Développement Web', status: 'validé', studentId: 'u3', submittedAt: '2024-03-01' },
    { id: 's2', companyName: 'Wave Afrique', companyLogo: 'WA', title: 'Stage Data Analyst', description: 'Analysez les données de transactions.', duration: '2 mois', domain: 'Data Science', status: 'en_attente', submittedAt: '2024-03-10' },
    { id: 's3', companyName: 'MTN Côte d\'Ivoire', companyLogo: 'MT', title: 'Stage UI/UX Designer', description: 'Concevez des expériences utilisateur.', duration: '3 mois', domain: 'Design', status: 'en_attente', submittedAt: '2024-03-15' },
    { id: 's4', companyName: 'Jumia Africa', companyLogo: 'JA', title: 'Stage ML Engineer', description: 'Développez des algorithmes de recommandation.', duration: '4 mois', domain: 'IA & ML', status: 'refusé', submittedAt: '2024-02-20' },
  ]);

  console.log('✅ Seed completed successfully!');
  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});