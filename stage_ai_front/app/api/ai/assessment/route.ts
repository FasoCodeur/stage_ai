import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

const MODEL = "openai/gpt-oss-20b"
export const maxDuration = 30

/** Extrait un objet JSON d'une réponse de modèle (tolère les balises markdown). */
function parseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

interface GeneratedQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  competence?: string
}

interface EvaluationAnswer {
  question: string
  selectedIndex: number
  correctIndex: number
  competence?: string
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const action = body?.action

  // ── 1. Générer le test de positionnement ──
  if (action === "generate") {
    const objectifMetier: string = body.objectifMetier || "Développeur Web"
    const prompt = `Tu es un évaluateur pédagogique pour une plateforme de formation africaine.
Objectif métier de l'étudiant : "${objectifMetier}".

Génère exactement 8 questions à choix multiples pour évaluer son niveau de DÉPART sur ce métier.
Couvre des compétences variées et progressives (bases, puis notions intermédiaires).

Réponds UNIQUEMENT avec ce JSON, sans aucun texte autour :
{
  "questions": [
    {
      "id": "q1",
      "question": "…",
      "options": ["…", "…", "…", "…"],
      "correctIndex": 0,
      "competence": "Nom court de la compétence évaluée"
    }
  ]
}

Règles : 4 options par question, une seule bonne réponse, questions en français, concrètes et sans piège.`

    try {
      const { text } = await generateText({ model: groq(MODEL), prompt })
      const parsed = parseJson<{ questions: GeneratedQuestion[] }>(text)

      if (!parsed?.questions?.length) {
        return Response.json(
          { error: "L'IA n'a pas pu générer le test. Veuillez réessayer." },
          { status: 502 },
        )
      }

      // Normalisation défensive
      const questions = parsed.questions.slice(0, 10).map((q, i) => ({
        id: q.id ?? `q${i + 1}`,
        question: String(q.question ?? "").trim(),
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
        correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
        competence: q.competence ?? `Compétence ${i + 1}`,
      }))

      return Response.json({ questions })
    } catch {
      return Response.json(
        { error: "Le service d'évaluation est momentanément indisponible. Veuillez réessayer." },
        { status: 503 },
      )
    }
  }

  // ── 2. Évaluer les réponses ──
  if (action === "evaluate") {
    const objectifMetier: string = body.objectifMetier || "Développeur Web"
    const answers: EvaluationAnswer[] = Array.isArray(body.answers) ? body.answers : []

    if (answers.length === 0) {
      return Response.json({ error: "Aucune réponse à évaluer." }, { status: 400 })
    }

    const justes = answers.filter((a) => a.selectedIndex === a.correctIndex)
    const ratees = answers.filter((a) => a.selectedIndex !== a.correctIndex)
    const score = Math.round((justes.length / answers.length) * 100)

    const list = answers
      .map(
        (a, i) =>
          `${i + 1}. ${a.question} — ${a.selectedIndex === a.correctIndex ? "CORRECT" : "FAUX"} (compétence : ${a.competence ?? "générale"})`,
      )
      .join("\n")

    const prompt = `Tu es un évaluateur pédagogique. Objectif métier de l'étudiant : "${objectifMetier}".
Score obtenu : ${score}/100 (${justes.length} bonnes réponses sur ${answers.length}).

Détail des réponses :
${list}

Analyse et réponds UNIQUEMENT avec ce JSON :
{
  "niveau": "Débutant|Intermédiaire|Avancé",
  "pointsForts": ["…", "…"],
  "lacunes": ["…", "…"],
  "resume": "Deux phrases maximum, encourageantes et concrètes."
}

Règles : "Débutant" si score < 50, "Intermédiaire" si 50-79, "Avancé" si >= 80. Réponds en français.`

    try {
      const { text } = await generateText({ model: groq(MODEL), prompt })
      const parsed = parseJson<{
        niveau: string
        pointsForts: string[]
        lacunes: string[]
        resume: string
      }>(text)

      const niveauFallback = score < 50 ? "Débutant" : score < 80 ? "Intermédiaire" : "Avancé"

      return Response.json({
        score,
        niveau: parsed?.niveau ?? niveauFallback,
        pointsForts: Array.isArray(parsed?.pointsForts) ? parsed!.pointsForts : [],
        lacunes: Array.isArray(parsed?.lacunes) ? parsed!.lacunes : [],
        resume:
          parsed?.resume ??
          `Vous avez obtenu ${score}/100. Votre parcours sera adapté à votre niveau ${niveauFallback.toLowerCase()}.`,
        justes: justes.map((a) => a.competence).filter(Boolean),
        ratees: ratees.map((a) => a.competence).filter(Boolean),
      })
    } catch {
      // Repli déterministe : l'étudiant n'est jamais bloqué
      return Response.json({
        score,
        niveau: score < 50 ? "Débutant" : score < 80 ? "Intermédiaire" : "Avancé",
        pointsForts: [],
        lacunes: [],
        resume: `Vous avez obtenu ${score}/100. Votre parcours sera adapté à votre niveau.`,
        justes: [],
        ratees: [],
      })
    }
  }

  return Response.json({ error: "Action inconnue." }, { status: 400 })
}
