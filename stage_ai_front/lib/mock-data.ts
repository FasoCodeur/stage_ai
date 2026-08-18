// -------------------------------------------------------
// StageIA — Types partagés (les données viennent de l'API)
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

export type ContentBlockType = "texte" | "video" | "quiz" | "sandbox"
export type SandboxLanguage = "html" | "python" | "javascript" | "java" | "c" | "cpp"

export interface ContentBlock {
  id: string
  type: ContentBlockType
  title?: string
  content?: string
  videoUrl?: string
  quiz?: QuizQuestion[]
  sandboxCode?: string
  language?: SandboxLanguage
}

export interface Lesson {
  id: string
  title: string
  duration: number // minutes
  blocks: ContentBlock[]
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
  correctIndexes: number[]
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
// Helpers
// -------------------------------------------------------
export function isCourseNew(course: Course): boolean {
  const created = new Date(course.createdAt)
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}