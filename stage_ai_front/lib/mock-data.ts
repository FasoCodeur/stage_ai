// -------------------------------------------------------
// StageIA — Mock Data
// -------------------------------------------------------

export type Role = "admin" | "professeur" | "etudiant"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar: string
  phone?: string
  ville?: string
  niveau?: string
  lastLogin?: string // date de dernière connexion
  suspended?: boolean // compte suspendu
}

export interface Lesson {
  id: string
  title: string
  type: "texte" | "video" | "quiz" | "sandbox"
  content: string
  videoUrl?: string
  quiz?: QuizQuestion[]
  sandboxCode?: string
  duration: number // minutes
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: "Débutant" | "Intermédiaire" | "Avancé"
  duration: number // heures
  price: number // FCFA
  professorId: string
  published: boolean
  thumbnail: string
  modules: Module[]
  students: string[] // user ids
  createdAt: string
}

export interface Enrollment {
  userId: string
  courseId: string
  progress: number // 0-100
  completedLessons: string[]
  enrolledAt: string
}

export interface Subscription {
  userId: string
  plan: "mensuel"
  status: "active" | "expiree"
  startDate: string
  endDate: string // ISO date
}

export interface Purchase {
  userId: string
  courseId: string
  method: "orange_money" | "carte"
  purchasedAt: string
}

export interface StageRequest {
  id: string
  companyName: string
  companyLogo: string
  title: string
  description: string
  duration: string
  domain: string
  status: "en_attente" | "validé" | "refusé"
  studentId?: string
  submittedAt: string
}

export interface Level {
  id: string
  programId: string
  title: string
  description: string
  duration: number // jours
  order: number // 1, 2, 3...
  courses: string[] // course IDs
}

export interface Program {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number // mois
  subscriptionPrice: number // prix abonnement mensuel FCFA
  mentorId: string
  published: boolean
  startDate: string
  endDate: string
  students: string[] // user IDs
  createdAt: string
}

export interface ProgramEnrollment {
  userId: string
  programId: string
  progress: number // 0-100
  currentLevelIndex: number // index du niveau actuel (0 = premier)
  completedLevels: string[] // IDs des niveaux validés
  completedCourses: string[] // IDs des cours complétés
  status: "active" | "completed" | "expired"
  enrolledAt: string
  mentorNotes?: string
}

// -------------------------------------------------------
// Users
// -------------------------------------------------------
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export const USERS: User[] = [
  {
    id: "u1",
    name: "Amadou Diallo",
    email: "admin@stageia.com",
    password: "admin123",
    role: "admin",
    avatar: "AD",
    phone: "+221 77 000 00 01",
    ville: "Dakar",
    lastLogin: daysAgo(0),
    suspended: false,
  },
  {
    id: "u2",
    name: "Fatou Ndiaye",
    email: "prof@stageia.com",
    password: "prof123",
    role: "professeur",
    avatar: "FN",
    phone: "+221 77 000 00 02",
    ville: "Dakar",
    niveau: "Bac+5",
    lastLogin: daysAgo(1),
    suspended: false,
  },
  {
    id: "u3",
    name: "Ibrahima Sow",
    email: "etudiant@stageia.com",
    password: "etudiant123",
    role: "etudiant",
    avatar: "IS",
    phone: "+221 77 000 00 03",
    ville: "Thiès",
    niveau: "Bac+2",
    lastLogin: daysAgo(2),
    suspended: false,
  },
  {
    id: "u4",
    name: "Mariama Balde",
    email: "mariama@stageia.com",
    password: "etudiant123",
    role: "etudiant",
    avatar: "MB",
    ville: "Conakry",
    niveau: "Bac",
    lastLogin: daysAgo(5),
    suspended: false,
  },
  {
    id: "u5",
    name: "Omar Coulibaly",
    email: "omar@stageia.com",
    password: "etudiant123",
    role: "etudiant",
    avatar: "OC",
    ville: "Abidjan",
    niveau: "Bac+3",
    lastLogin: daysAgo(1),
    suspended: false,
  },
  {
    id: "u6",
    name: "Aissatou Barry",
    email: "aissatou@stageia.com",
    password: "etudiant123",
    role: "etudiant",
    avatar: "AB",
    ville: "Bamako",
    niveau: "Bac+2",
    lastLogin: daysAgo(10),
    suspended: false,
  },
]

// -------------------------------------------------------
// Courses
// -------------------------------------------------------
export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Introduction au Développement Web",
    description: "Apprenez les bases du HTML, CSS et JavaScript pour créer vos premières pages web modernes.",
    category: "Développement Web", level: "Débutant", duration: 20, price: 35000,
    professorId: "u2", published: true, thumbnail: "🌐",
    students: ["u3", "u4", "u5"], createdAt: "2024-01-15",
    modules: [
      { id: "m1", title: "Fondamentaux HTML", lessons: [
        { id: "l1", title: "Structure d'une page HTML", type: "texte", content: "## Structure HTML\n\nUne page HTML est composée d'éléments imbriqués.", duration: 15 },
        { id: "l2", title: "Les balises essentielles", type: "video", content: "Découvrez les balises HTML.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 20 },
        { id: "l3", title: "Quiz HTML", type: "quiz", content: "Testez vos connaissances.", duration: 10, quiz: [
          { id: "q1", question: "Quel élément HTML définit le titre de la page ?", options: ["<title>", "<head>", "<h1>", "<meta>"], correctIndex: 0 },
          { id: "q2", question: "Quelle balise crée un lien hypertexte ?", options: ["<link>", "<a>", "<href>", "<url>"], correctIndex: 1 },
          { id: "q3", question: "Comment ajoute-t-on une image en HTML ?", options: ["<img>", "<image>", "<pic>", "<photo>"], correctIndex: 0 },
        ]},
      ]},
      { id: "m2", title: "CSS Moderne", lessons: [
        { id: "l4", title: "Introduction au CSS", type: "texte", content: "## CSS — Cascading Style Sheets", duration: 15 },
        { id: "l5", title: "Exercice : Créer un bouton CSS", type: "sandbox", content: "Créez un bouton stylé.", sandboxCode: '<button class="btn">Cliquez-moi</button>\n\n<style>.btn { background-color: #3b3fb8; color: white; padding: 10px 20px; border-radius: 6px; }</style>', duration: 20 },
      ]},
      { id: "m3", title: "JavaScript Essentiel", lessons: [
        { id: "l6", title: "Variables et types de données", type: "texte", content: "## Variables en JavaScript", duration: 15 },
        { id: "l7", title: "Sandbox JS", type: "sandbox", content: "Pratiquez JavaScript.", sandboxCode: 'function saluer(nom) { return `Bonjour, ${nom} !`; }\nconsole.log(saluer("Ibrahima"));', duration: 25 },
      ]},
    ],
  },
  {
    id: "c2", title: "Python pour la Data Science",
    description: "Maîtrisez Python et ses bibliothèques (Pandas, NumPy) pour analyser et visualiser des données.",
    category: "Data Science", level: "Intermédiaire", duration: 35, price: 35000,
    professorId: "u2", published: true, thumbnail: "📊",
    students: ["u3", "u6"], createdAt: "2024-02-10",
    modules: [
      { id: "m4", title: "Python Fondamentaux", lessons: [
        { id: "l8", title: "Introduction à Python", type: "texte", content: "## Python", duration: 20 },
        { id: "l9", title: "Quiz Python Débutant", type: "quiz", content: "Testez vos bases Python.", duration: 10, quiz: [
          { id: "q4", question: "Comment afficher du texte en Python ?", options: ["echo()", "print()", "console.log()", "display()"], correctIndex: 1 },
          { id: "q5", question: "Quel signe est utilisé pour les commentaires Python ?", options: ["//", "/*", "#", "--"], correctIndex: 2 },
        ]},
      ]},
      { id: "m5", title: "Pandas & Analyse de Données", lessons: [
        { id: "l10", title: "Introduction à Pandas", type: "texte", content: "## Pandas", duration: 25 },
      ]},
    ],
  },
  {
    id: "c3", title: "UI/UX Design Pratique",
    description: "Apprenez à concevoir des interfaces utilisateur modernes avec Figma et les principes du design thinking.",
    category: "Design", level: "Débutant", duration: 18, price: 35000,
    professorId: "u2", published: false, thumbnail: "🎨",
    students: [], createdAt: "2024-03-05",
    modules: [
      { id: "m6", title: "Principes du Design", lessons: [
        { id: "l11", title: "Les 4 principes fondamentaux", type: "texte", content: "## CRAP : Contraste, Répétition, Alignement, Proximité", duration: 20 },
      ]},
    ],
  },
  {
    id: "c4", title: "Intelligence Artificielle & Machine Learning",
    description: "Comprenez les fondements du ML et construisez vos premiers modèles avec scikit-learn et TensorFlow.",
    category: "IA & ML", level: "Avancé", duration: 45, price: 35000,
    professorId: "u2", published: true, thumbnail: "🤖",
    students: ["u5"], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    modules: [
      { id: "m7", title: "Fondements du Machine Learning", lessons: [
        { id: "l12", title: "Qu'est-ce que le Machine Learning ?", type: "texte", content: "## Machine Learning\n\nLe ML est une branche de l'IA qui permet aux systèmes d'apprendre.", duration: 30 },
      ]},
    ],
  },
]

// -------------------------------------------------------
// Enrollments
// -------------------------------------------------------
export const ENROLLMENTS: Enrollment[] = [
  { userId: "u3", courseId: "c1", progress: 68, completedLessons: ["l1", "l2", "l3", "l4"], enrolledAt: "2024-01-20" },
  { userId: "u3", courseId: "c2", progress: 30, completedLessons: ["l8"], enrolledAt: "2024-02-15" },
  { userId: "u4", courseId: "c1", progress: 45, completedLessons: ["l1", "l2", "l3"], enrolledAt: "2024-01-22" },
  { userId: "u5", courseId: "c1", progress: 90, completedLessons: ["l1", "l2", "l3", "l4", "l5", "l6"], enrolledAt: "2024-01-18" },
  { userId: "u5", courseId: "c4", progress: 15, completedLessons: ["l12"], enrolledAt: "2024-03-25" },
  { userId: "u6", courseId: "c2", progress: 55, completedLessons: ["l8", "l9"], enrolledAt: "2024-02-18" },
]

// -------------------------------------------------------
// Subscriptions & Purchases
// -------------------------------------------------------
export const SUBSCRIPTIONS: Subscription[] = [
  { userId: "u3", plan: "mensuel", status: "active", startDate: "2024-06-01", endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
]

export const PURCHASES: Purchase[] = [
  { userId: "u5", courseId: "c1", method: "orange_money", purchasedAt: "2024-03-10" },
  { userId: "u5", courseId: "c4", method: "orange_money", purchasedAt: "2024-03-25" },
]

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
export function isCourseNew(course: Course): boolean {
  const created = new Date(course.createdAt)
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}

export function hasAccess(userId: string, courseId: string): boolean {
  const sub = SUBSCRIPTIONS.find((s) => s.userId === userId && s.status === "active" && new Date(s.endDate) >= new Date())
  if (sub) return true
  if (PURCHASES.some((p) => p.userId === userId && p.courseId === courseId)) return true
  const activeEnrollments = PROGRAM_ENROLLMENTS.filter((e) => e.userId === userId && e.status === "active")
  for (const enrollment of activeEnrollments) {
    const programLevels = LEVELS.filter((l) => l.programId === enrollment.programId)
    if (programLevels.some((level) => level.courses.includes(courseId))) return true
  }
  return false
}

export function getSubscription(userId: string): Subscription | null {
  return SUBSCRIPTIONS.find((s) => s.userId === userId && s.status === "active" && new Date(s.endDate) >= new Date()) ?? null
}

// -------------------------------------------------------
// Stage Requests
// -------------------------------------------------------
export const STAGE_REQUESTS: StageRequest[] = [
  { id: "s1", companyName: "Orange Sénégal", companyLogo: "OS", title: "Stage Développeur Web Front-End", description: "Rejoignez l'équipe digitale d'Orange.", duration: "3 mois", domain: "Développement Web", status: "validé", studentId: "u3", submittedAt: "2024-03-01" },
  { id: "s2", companyName: "Wave Afrique", companyLogo: "WA", title: "Stage Data Analyst", description: "Analysez les données de transactions.", duration: "2 mois", domain: "Data Science", status: "en_attente", submittedAt: "2024-03-10" },
  { id: "s3", companyName: "MTN Côte d'Ivoire", companyLogo: "MT", title: "Stage UI/UX Designer", description: "Concevez des expériences utilisateur.", duration: "3 mois", domain: "Design", status: "en_attente", submittedAt: "2024-03-15" },
  { id: "s4", companyName: "Jumia Africa", companyLogo: "JA", title: "Stage ML Engineer", description: "Développez des algorithmes de recommandation.", duration: "4 mois", domain: "IA & ML", status: "refusé", submittedAt: "2024-02-20" },
]

// -------------------------------------------------------
// Levels
// -------------------------------------------------------
export const LEVELS: Level[] = [
  { id: "l1", programId: "p1", title: "Fondamentaux du Web", description: "HTML, CSS et les bases de JavaScript", duration: 30, order: 1, courses: ["c1"] },
  { id: "l2", programId: "p1", title: "Développement Front-End", description: "React, TypeScript et frameworks modernes", duration: 45, order: 2, courses: [] },
  { id: "l3", programId: "p1", title: "Développement Back-End", description: "Node.js, Express et bases de données", duration: 45, order: 3, courses: [] },
  { id: "l4", programId: "p2", title: "Fondamentaux Python & Data", description: "Python, Pandas et analyse de données", duration: 30, order: 1, courses: ["c2"] },
  { id: "l5", programId: "p2", title: "Machine Learning & IA", description: "Algorithmes ML, scikit-learn et TensorFlow", duration: 45, order: 2, courses: ["c4"] },
  { id: "l6", programId: "p3", title: "Design Thinking & UX Research", description: "Méthodologies de recherche utilisateur", duration: 25, order: 1, courses: [] },
  { id: "l7", programId: "p3", title: "UI Design avec Figma", description: "Prototypage et design d'interface", duration: 35, order: 2, courses: [] },
]

// -------------------------------------------------------
// Programs
// -------------------------------------------------------
export const PROGRAMS: Program[] = [
  {
    id: "p1",
    title: "Développement Web Full-Stack",
    description: "Devenez développeur web complet en 6 mois. Maîtrisez HTML, CSS, JavaScript, React, Node.js et les bases de données. Accompagnement personnalisé par un mentor.",
    thumbnail: "🚀", duration: 6, subscriptionPrice: 15000, mentorId: "u2",
    published: true, startDate: "2024-09-01", endDate: "2025-02-28",
    students: ["u3", "u5"], createdAt: "2024-08-01",
  },
  {
    id: "p2",
    title: "Data Science & Intelligence Artificielle",
    description: "Un programme intensif de 4 mois pour maîtriser Python, l'analyse de données, le Machine Learning et le Deep Learning avec un mentor expert.",
    thumbnail: "🤖", duration: 4, subscriptionPrice: 15000, mentorId: "u2",
    published: true, startDate: "2024-10-01", endDate: "2025-01-31",
    students: ["u3"], createdAt: "2024-08-15",
  },
  {
    id: "p3",
    title: "Design UI/UX & Product Design",
    description: "Apprenez le design d'interface et d'expérience utilisateur en 3 mois. De la recherche utilisateur au prototypage avec Figma, suivi par un mentor designer.",
    thumbnail: "🎨", duration: 3, subscriptionPrice: 12000, mentorId: "u2",
    published: false, startDate: "2024-11-01", endDate: "2025-01-31",
    students: [], createdAt: "2024-09-01",
  },
]

// -------------------------------------------------------
// Program Enrollments
// -------------------------------------------------------
export const PROGRAM_ENROLLMENTS: ProgramEnrollment[] = [
  { userId: "u3", programId: "p1", progress: 35, currentLevelIndex: 0, completedLevels: [], completedCourses: ["c1"], status: "active", enrolledAt: "2024-09-01" },
  { userId: "u5", programId: "p1", progress: 0, currentLevelIndex: 0, completedLevels: [], completedCourses: [], status: "active", enrolledAt: "2024-09-05" },
  { userId: "u3", programId: "p2", progress: 0, currentLevelIndex: 0, completedLevels: [], completedCourses: [], status: "active", enrolledAt: "2024-10-01" },
]