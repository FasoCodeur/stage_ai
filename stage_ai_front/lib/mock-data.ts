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

// -------------------------------------------------------
// Users
// -------------------------------------------------------
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
  },
]

// -------------------------------------------------------
// Courses
// -------------------------------------------------------
export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Introduction au Développement Web",
    description:
      "Apprenez les bases du HTML, CSS et JavaScript pour créer vos premières pages web modernes.",
    category: "Développement Web",
    level: "Débutant",
    duration: 20,
    price: 35000,
    professorId: "u2",
    published: true,
    thumbnail: "🌐",
    students: ["u3", "u4", "u5"],
    createdAt: "2024-01-15",
    modules: [
      {
        id: "m1",
        title: "Fondamentaux HTML",
        lessons: [
          {
            id: "l1",
            title: "Structure d'une page HTML",
            type: "texte",
            content:
              "## Structure HTML\n\nUne page HTML est composée d'éléments imbriqués. La structure de base est :\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Ma page</title>\n  </head>\n  <body>\n    <h1>Bonjour</h1>\n  </body>\n</html>\n```\n\nChaque élément HTML est délimité par une balise ouvrante et fermante.",
            duration: 15,
          },
          {
            id: "l2",
            title: "Les balises essentielles",
            type: "video",
            content: "Découvrez les balises HTML les plus importantes.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 20,
          },
          {
            id: "l3",
            title: "Quiz HTML",
            type: "quiz",
            content: "Testez vos connaissances sur HTML.",
            duration: 10,
            quiz: [
              {
                id: "q1",
                question: "Quel élément HTML définit le titre de la page ?",
                options: ["<title>", "<head>", "<h1>", "<meta>"],
                correctIndex: 0,
              },
              {
                id: "q2",
                question: "Quelle balise crée un lien hypertexte ?",
                options: ["<link>", "<a>", "<href>", "<url>"],
                correctIndex: 1,
              },
              {
                id: "q3",
                question: "Comment ajoute-t-on une image en HTML ?",
                options: ["<img>", "<image>", "<pic>", "<photo>"],
                correctIndex: 0,
              },
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "CSS Moderne",
        lessons: [
          {
            id: "l4",
            title: "Introduction au CSS",
            type: "texte",
            content:
              "## CSS — Cascading Style Sheets\n\nLe CSS permet de styliser vos pages HTML. On l'utilise pour définir les couleurs, les polices, les espacements, et la mise en page.\n\n```css\nbody {\n  font-family: 'Inter', sans-serif;\n  background-color: #f5f5f5;\n  margin: 0;\n  padding: 0;\n}\n```",
            duration: 15,
          },
          {
            id: "l5",
            title: "Exercice : Créer un bouton CSS",
            type: "sandbox",
            content: "Créez un bouton stylé en CSS.",
            sandboxCode:
              '<!-- Exercice : Stylisez ce bouton -->\n<button class="btn">Cliquez-moi</button>\n\n<style>\n.btn {\n  /* Ajoutez vos styles ici */\n  background-color: #3b3fb8;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}\n</style>',
            duration: 20,
          },
        ],
      },
      {
        id: "m3",
        title: "JavaScript Essentiel",
        lessons: [
          {
            id: "l6",
            title: "Variables et types de données",
            type: "texte",
            content:
              "## Variables en JavaScript\n\nJavaScript utilise `let`, `const` et `var` pour déclarer des variables.\n\n```js\nconst nom = 'Fatou';\nlet age = 22;\nvar actif = true;\n\nconsole.log(`Bonjour ${nom}, tu as ${age} ans.`);\n```",
            duration: 15,
          },
          {
            id: "l7",
            title: "Sandbox JS",
            type: "sandbox",
            content: "Pratiquez JavaScript dans cet environnement.",
            sandboxCode:
              '// Exercice : Créez une fonction qui salue un utilisateur\nfunction saluer(nom) {\n  // Votre code ici\n  return `Bonjour, ${nom} !`;\n}\n\nconsole.log(saluer("Ibrahima"));\n',
            duration: 25,
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Python pour la Data Science",
    description:
      "Maîtrisez Python et ses bibliothèques (Pandas, NumPy) pour analyser et visualiser des données.",
    category: "Data Science",
    level: "Intermédiaire",
    duration: 35,
    price: 35000,
    professorId: "u2",
    published: true,
    thumbnail: "📊",
    students: ["u3", "u6"],
    createdAt: "2024-02-10",
    modules: [
      {
        id: "m4",
        title: "Python Fondamentaux",
        lessons: [
          {
            id: "l8",
            title: "Introduction à Python",
            type: "texte",
            content:
              "## Python\n\nPython est un langage de programmation populaire, lisible et polyvalent, très utilisé en data science.\n\n```python\n# Votre premier programme Python\nprint('Hello, StageIA!')\n\nnoms = ['Fatou', 'Omar', 'Awa']\nfor nom in noms:\n    print(f'Bonjour {nom}')\n```",
            duration: 20,
          },
          {
            id: "l9",
            title: "Quiz Python Débutant",
            type: "quiz",
            content: "Testez vos bases Python.",
            duration: 10,
            quiz: [
              {
                id: "q4",
                question: "Comment afficher du texte en Python ?",
                options: ["echo()", "print()", "console.log()", "display()"],
                correctIndex: 1,
              },
              {
                id: "q5",
                question: "Quel signe est utilisé pour les commentaires Python ?",
                options: ["//", "/*", "#", "--"],
                correctIndex: 2,
              },
            ],
          },
        ],
      },
      {
        id: "m5",
        title: "Pandas & Analyse de Données",
        lessons: [
          {
            id: "l10",
            title: "Introduction à Pandas",
            type: "texte",
            content:
              "## Pandas\n\nPandas est la bibliothèque phare pour la manipulation de données en Python.\n\n```python\nimport pandas as pd\n\n# Créer un DataFrame\ndf = pd.DataFrame({\n    'nom': ['Fatou', 'Omar', 'Awa'],\n    'score': [85, 92, 78]\n})\n\nprint(df.describe())\n```",
            duration: 25,
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "UI/UX Design Pratique",
    description:
      "Apprenez à concevoir des interfaces utilisateur modernes avec Figma et les principes du design thinking.",
    category: "Design",
    level: "Débutant",
    duration: 18,
    price: 35000,
    professorId: "u2",
    published: false,
    thumbnail: "🎨",
    students: [],
    createdAt: "2024-03-05",
    modules: [
      {
        id: "m6",
        title: "Principes du Design",
        lessons: [
          {
            id: "l11",
            title: "Les 4 principes fondamentaux",
            type: "texte",
            content:
              "## CRAP : Contraste, Répétition, Alignement, Proximité\n\nCes 4 principes sont la base de tout bon design.\n\n- **Contraste** : Différencier les éléments visuellement\n- **Répétition** : Créer de la cohérence\n- **Alignement** : Organiser les éléments\n- **Proximité** : Regrouper les éléments liés",
            duration: 20,
          },
        ],
      },
    ],
  },
  {
    id: "c4",
    title: "Intelligence Artificielle & Machine Learning",
    description:
      "Comprenez les fondements du ML et construisez vos premiers modèles avec scikit-learn et TensorFlow.",
    category: "IA & ML",
    level: "Avancé",
    duration: 45,
    price: 35000,
    professorId: "u2",
    published: true,
    thumbnail: "🤖",
    students: ["u5"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days ago
    modules: [
      {
        id: "m7",
        title: "Fondements du Machine Learning",
        lessons: [
          {
            id: "l12",
            title: "Qu'est-ce que le Machine Learning ?",
            type: "texte",
            content:
              "## Machine Learning\n\nLe ML est une branche de l'IA qui permet aux systèmes d'apprendre à partir de données sans être explicitement programmés.\n\n**Types de ML :**\n- Apprentissage supervisé\n- Apprentissage non-supervisé\n- Apprentissage par renforcement",
            duration: 30,
          },
        ],
      },
    ],
  },
]

// -------------------------------------------------------
// Enrollments
// -------------------------------------------------------
export const ENROLLMENTS: Enrollment[] = [
  {
    userId: "u3",
    courseId: "c1",
    progress: 68,
    completedLessons: ["l1", "l2", "l3", "l4"],
    enrolledAt: "2024-01-20",
  },
  {
    userId: "u3",
    courseId: "c2",
    progress: 30,
    completedLessons: ["l8"],
    enrolledAt: "2024-02-15",
  },
  {
    userId: "u4",
    courseId: "c1",
    progress: 45,
    completedLessons: ["l1", "l2", "l3"],
    enrolledAt: "2024-01-22",
  },
  {
    userId: "u5",
    courseId: "c1",
    progress: 90,
    completedLessons: ["l1", "l2", "l3", "l4", "l5", "l6"],
    enrolledAt: "2024-01-18",
  },
  {
    userId: "u5",
    courseId: "c4",
    progress: 15,
    completedLessons: ["l12"],
    enrolledAt: "2024-03-25",
  },
  {
    userId: "u6",
    courseId: "c2",
    progress: 55,
    completedLessons: ["l8", "l9"],
    enrolledAt: "2024-02-18",
  },
]

// -------------------------------------------------------
// Subscriptions & Purchases
// -------------------------------------------------------

export const SUBSCRIPTIONS: Subscription[] = [
  {
    userId: "u3",
    plan: "mensuel",
    status: "active",
    startDate: "2024-06-01",
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
]

export const PURCHASES: Purchase[] = [
  {
    userId: "u5",
    courseId: "c1",
    method: "orange_money",
    purchasedAt: "2024-03-10",
  },
  {
    userId: "u5",
    courseId: "c4",
    method: "orange_money",
    purchasedAt: "2024-03-25",
  },
]

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

/** Returns true if the course was created within the last 14 days */
export function isCourseNew(course: Course): boolean {
  const created = new Date(course.createdAt)
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}

/** Returns true if the user has access to a course (active subscription OR individual purchase) */
export function hasAccess(userId: string, courseId: string): boolean {
  const sub = SUBSCRIPTIONS.find(
    (s) => s.userId === userId && s.status === "active" && new Date(s.endDate) >= new Date()
  )
  if (sub) return true
  return PURCHASES.some((p) => p.userId === userId && p.courseId === courseId)
}

/** Returns the active subscription for a user, or null */
export function getSubscription(userId: string): Subscription | null {
  return (
    SUBSCRIPTIONS.find(
      (s) => s.userId === userId && s.status === "active" && new Date(s.endDate) >= new Date()
    ) ?? null
  )
}

// -------------------------------------------------------
// Stage Requests
// -------------------------------------------------------
export const STAGE_REQUESTS: StageRequest[] = [
  {
    id: "s1",
    companyName: "Orange Sénégal",
    companyLogo: "OS",
    title: "Stage Développeur Web Front-End",
    description:
      "Rejoignez l'équipe digitale d'Orange pour développer des interfaces utilisateur modernes.",
    duration: "3 mois",
    domain: "Développement Web",
    status: "validé",
    studentId: "u3",
    submittedAt: "2024-03-01",
  },
  {
    id: "s2",
    companyName: "Wave Afrique",
    companyLogo: "WA",
    title: "Stage Data Analyst",
    description:
      "Analysez les données de transactions pour optimiser les services financiers de Wave.",
    duration: "2 mois",
    domain: "Data Science",
    status: "en_attente",
    submittedAt: "2024-03-10",
  },
  {
    id: "s3",
    companyName: "MTN Côte d'Ivoire",
    companyLogo: "MT",
    title: "Stage UI/UX Designer",
    description:
      "Concevez des expériences utilisateur pour les applications mobiles MTN.",
    duration: "3 mois",
    domain: "Design",
    status: "en_attente",
    submittedAt: "2024-03-15",
  },
  {
    id: "s4",
    companyName: "Jumia Africa",
    companyLogo: "JA",
    title: "Stage Machine Learning Engineer",
    description:
      "Développez des algorithmes de recommandation pour la plateforme e-commerce.",
    duration: "4 mois",
    domain: "IA & ML",
    status: "refusé",
    submittedAt: "2024-02-20",
  },
]
