// -------------------------------------------------------
// StageIA — Types partagés (les données viennent de l'API)
// -------------------------------------------------------

export type Role = "admin" | "professeur" | "etudiant" | "tuteur"

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
  entrepriseId?: string // ID de l'entreprise (pour les tuteurs)
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

export type Domaine = "dev_web" | "data_analyst" | "finance" | "marketing" | "design"

export interface Entreprise {
  id: string
  nom: string
  email: string
  contact: string
  logo?: string
  secteur?: string
  siteWeb?: string
  adresse?: string
  actif: boolean
  createdAt: string
}

export interface Offre {
  id: string
  titre: string
  description: string
  missions: string
  domaine: Domaine | string
  duree: string
  statut: "en_attente" | "validee" | "refusee"
  entrepriseId: string
  mentorId?: string
  domainData?: any
  createdAt: string
}

export interface Candidature {
  id: string
  offreId: string
  etudiantId: string
  statut: "en_attente" | "validee" | "refusee"
  createdAt: string
}

export interface Stage {
  id: string
  offreId: string
  etudiantId: string
  entrepriseId: string
  mentorId?: string
  statut: "actif" | "termine" | "abandonne"
  dateDebut: string
  dateFin: string
  progression: number
  scorePerformance: number
  domainData?: any
  createdAt: string
  // dashboard enrichi
  missionCourante?: Mission | null
  taches?: Tache[]
  heuresSemaine?: number
  livrables?: Livrable[]
  reunions?: Reunion[]
}

export interface Mission {
  id: string
  stageId: string
  titre: string
  description: string
  objectif?: string
  statut: "a_faire" | "en_cours" | "termine"
  deadline?: string
  domainData?: any
  createdAt: string
}

export interface Tache {
  id: string
  missionId: string
  titre: string
  description?: string
  statut: "a_faire" | "en_cours" | "termine"
  ordre: number
  createdAt: string
}

export interface Livrable {
  id: string
  missionId: string
  titre: string
  statut: "a_rendre" | "rendu" | "valide" | "rejete"
  fichierUrl?: string
  commentaire?: string
  dateRendu?: string
  createdAt: string
}

export interface TempsTravail {
  id: string
  stageId: string
  tacheId?: string
  missionId?: string
  dureeMinutes: number
  dateTravail: string
  createdAt: string
}

export interface Reunion {
  id: string
  stageId: string
  titre: string
  type: "stage" | "cohorte"
  lien?: string
  dateReunion: string
  dureeMinutes?: number
  createdAt: string
}

export interface Message {
  id: string
  stageId: string
  expediteurId: string
  contenu: string
  createdAt: string
}

export interface Notification {
  id: string
  destinataireId: string
  type: "email" | "in_app"
  titre: string
  contenu: string
  stageId?: string
  lu: boolean
  createdAt: string
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

/** Niveau envoyé lors de la création d'un programme (POST /programs). */
export interface ProgramLevelInput {
  title: string
  description?: string
  duration: number // jours
  courses?: string[] // IDs des cours
}

/** Charge utile de création d'un programme : informations + niveaux optionnels. */
export type CreateProgramPayload = Partial<Program> & { levels?: ProgramLevelInput[] }

/**
 * Étape envoyée lors de l'enregistrement d'un parcours existant
 * (`PUT /programs/:id/steps`). Un `id` présent = étape déjà enregistrée.
 */
export type ProgramStepInput = ProgramLevelInput & { id?: string }

export interface Program {
  id: string
  title: string
  description: string
  /** URL du logo téléversé (ex. « /uploads/… ») ou null si aucun logo. */
  thumbnail: string | null
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
// Parcours personnalisé par l'IA
// -------------------------------------------------------
export interface LearningPathStep {
  id: string
  pathId: string
  ordre: number
  titre: string
  description: string
  objectif?: string | null
  semaineDebut: number
  dureeHeures: number
  statut: "a_faire" | "en_cours" | "termine"
  courseId?: string | null
  suggestionId?: string | null
  competences: string[]
  createdAt: string
}

export interface LearningPath {
  id: string
  userId: string
  objectifMetier: string
  niveauEvalue: string
  titre: string
  resume: string
  statut: string
  modeleIA?: string | null
  createdAt: string
}

export interface LearningPathWithSteps {
  path: LearningPath
  steps: LearningPathStep[]
}

/** Cours manquant détecté par l'IA et proposé à l'administrateur. */
export interface CourseSuggestion {
  id: string
  titre: string
  description: string
  category: string
  level: string
  competences: string[]
  justification: string
  objectifMetier?: string | null
  sourcePathId?: string | null
  demandeurId?: string | null
  statut: "en_attente" | "acceptee" | "refusee"
  motifRefus?: string | null
  reviewedBy?: string | null
  courseId?: string | null
  createdAt: string
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
export function isCourseNew(course: Course): boolean {
  const created = new Date(course.createdAt)
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}