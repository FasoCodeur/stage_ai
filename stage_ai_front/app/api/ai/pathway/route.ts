import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

const MODEL = "openai/gpt-oss-20b"
export const maxDuration = 45

interface CatalogueCourse {
  id: string
  title: string
  category: string
  level: string
}

/** Extrait un objet JSON d'une réponse de modèle (tolère les balises markdown). */
function parseJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

interface RawStep {
  ordre?: number
  titre?: string
  description?: string
  objectif?: string
  semaineDebut?: number
  dureeHeures?: number
  courseId?: string | null
  competences?: string[]
  suggestedCourse?: Record<string, unknown> | null
}

interface RawPath {
  titre?: string
  resume?: string
  steps?: RawStep[]
}

/** Normalise les étapes de l'IA en validant les courseId contre le catalogue réel. */
function normaliserEtapes(
  steps: RawStep[],
  catalogue: CatalogueCourse[],
  niveauEvalue: string,
  objectifMetier: string,
) {
  const idsValides = new Set(catalogue.map((c) => c.id))

  return steps.slice(0, 10).map((raw, index) => {
    const courseIdRaw = raw.courseId ? String(raw.courseId) : null
    const courseId = courseIdRaw && idsValides.has(courseIdRaw) ? courseIdRaw : null
    const suggested = (raw.suggestedCourse ?? null) as Record<string, unknown> | null

    return {
      ordre: Number(raw.ordre) || index + 1,
      titre: String(raw.titre ?? `Étape ${index + 1}`),
      description: String(raw.description ?? ""),
      objectif: raw.objectif ? String(raw.objectif) : undefined,
      semaineDebut: Number(raw.semaineDebut) || index * 2 + 1,
      dureeHeures: Number(raw.dureeHeures) || 15,
      courseId,
      competences: Array.isArray(raw.competences) ? raw.competences.map(String) : [],
      suggestedCourse:
        courseId === null
          ? {
              category: String(suggested?.category ?? "Développement Web"),
              level: String(suggested?.level ?? niveauEvalue),
              justification: String(
                suggested?.justification ??
                  `Compétence nécessaire à l'objectif « ${objectifMetier} » absente du catalogue.`,
              ),
              competences: Array.isArray(suggested?.competences)
                ? (suggested!.competences as unknown[]).map(String)
                : [],
            }
          : null,
    }
  })
}

/**
 * Repli déterministe : construit un parcours progressif à partir du catalogue réel
 * (Débutant → Intermédiaire → Avancé) si l'IA échoue. L'étudiant n'est jamais bloqué.
 */
function parcoursDeSecours(
  catalogue: CatalogueCourse[],
  objectifMetier: string,
  niveauEvalue: string,
) {
  const ordreNiveau: Record<string, number> = { Débutant: 1, Intermédiaire: 2, Avancé: 3 }
  const tries = [...catalogue].sort(
    (a, b) => (ordreNiveau[a.level] ?? 1) - (ordreNiveau[b.level] ?? 1),
  )

  const selection = tries.slice(0, 6)
  const steps: {
    ordre: number
    titre: string
    description: string
    objectif: string
    semaineDebut: number
    dureeHeures: number
    courseId: string | null
    competences: string[]
    suggestedCourse: null
  }[] = selection.map((c, i) => ({
    ordre: i + 1,
    titre: c.title,
    description: `Suivez le cours « ${c.title} » (${c.category} · ${c.level}).`,
    objectif: `Maîtriser les compétences clés de ${c.category}.`,
    semaineDebut: i * 2 + 1,
    dureeHeures: 20,
    courseId: c.id,
    competences: [c.category],
    suggestedCourse: null,
  }))

  if (steps.length === 0) {
    steps.push({
      ordre: 1,
      titre: `Fondamentaux — ${objectifMetier}`,
      description: `Introduction aux bases indispensables pour devenir ${objectifMetier}.`,
      objectif: "Acquérir les fondations du métier.",
      semaineDebut: 1,
      dureeHeures: 20,
      courseId: null,
      competences: [objectifMetier],
      suggestedCourse: null,
    })
  }

  return {
    titre: `Parcours ${objectifMetier} — ${niveauEvalue}`,
    resume: "Parcours progressif construit à partir des cours disponibles sur la plateforme.",
    steps,
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const objectifMetier: string = body?.objectifMetier || "Développeur Web"
  const niveauEvalue: string = body?.niveauEvalue || "Débutant"
  const lacunes: string[] = Array.isArray(body?.lacunes) ? body.lacunes : []
  const dureeSemaines: number = Number(body?.dureeSemaines) || 12
  const catalogue: CatalogueCourse[] = Array.isArray(body?.catalogue) ? body.catalogue : []

  const catalogueTexte = catalogue.length
    ? catalogue.map((c) => `- id="${c.id}" | ${c.title} | ${c.category} | ${c.level}`).join("\n")
    : "(aucun cours disponible pour le moment)"

  const prompt = `Tu es un ingénieur pédagogique. Construis un PARCOURS DE FORMATION PERSONNALISÉ.

Profil de l'étudiant :
- Objectif métier : ${objectifMetier}
- Niveau évalué : ${niveauEvalue}
- Lacunes détectées : ${lacunes.length ? lacunes.join(", ") : "non renseignées"}
- Durée cible : environ ${dureeSemaines} semaines

CATALOGUE DE COURS DÉJÀ DISPONIBLES sur la plateforme (à privilégier) :
${catalogueTexte}

Construis 5 à 8 étapes ordonnées et progressives.

IMPORTANT :
- Si une étape est couverte par un cours du catalogue, renseigne "courseId" avec l'id EXACT du cours et mets "suggestedCourse": null.
- Si AUCUN cours du catalogue ne couvre la compétence, mets "courseId": null et remplis "suggestedCourse" (ce cours sera proposé à l'administrateur pour création).

Réponds UNIQUEMENT avec ce JSON, sans texte autour (garde les textes COURTS) :
{
  "titre": "Parcours …",
  "resume": "2 phrases maximum.",
  "steps": [
    {
      "ordre": 1,
      "titre": "Nom court de l'étape",
      "description": "1 phrase maximum.",
      "objectif": "Résultat concret (max 10 mots).",
      "semaineDebut": 1,
      "dureeHeures": 20,
      "courseId": "id-du-catalogue-ou-null",
      "competences": ["…", "…"],
      "suggestedCourse": null
    }
  ]
}

Quand "courseId" vaut null, "suggestedCourse" DOIT être un objet (jamais null) avec EXACTEMENT ces champs :
"category" (une catégorie pertinente pour le domaine : par exemple "Data Science", "Développement Web", "Design", "IA & ML", "Cybersécurité"…),
"level" ("Débutant" | "Intermédiaire" | "Avancé"),
"justification" (pourquoi ce cours manque, en une phrase),
"competences" (3 à 5 compétences visées).

Réponds en français. Les étapes doivent être concrètes et adaptées au niveau ${niveauEvalue}.`

  try {
    const { text } = await generateText({ model: groq(MODEL), prompt, maxOutputTokens: 2500 })
    const parsed = parseJson<RawPath>(text)

    if (parsed?.steps?.length) {
      return Response.json({
        titre: parsed.titre ?? `Parcours ${objectifMetier}`,
        resume: parsed.resume ?? "Parcours généré pour atteindre votre objectif professionnel.",
        objectifMetier,
        niveauEvalue,
        modeleIA: MODEL,
        steps: normaliserEtapes(parsed.steps, catalogue, niveauEvalue, objectifMetier),
      })
    }

    // Réponse inexploitable → on tente une seconde fois avec une consigne stricte
    console.warn("[ai/pathway] Réponse IA inexploitable, seconde tentative...")
    const retry = await generateText({
      model: groq(MODEL),
      prompt: `${prompt}\n\nIMPORTANT : réponds UNIQUEMENT par un objet JSON valide, sans commentaire ni texte avant/après. Le champ "steps" doit contenir entre 5 et 8 éléments.`,
      maxOutputTokens: 2500,
    })
    const parsedRetry = parseJson<RawPath>(retry.text)

    if (parsedRetry?.steps?.length) {
      return Response.json({
        titre: parsedRetry.titre ?? `Parcours ${objectifMetier}`,
        resume: parsedRetry.resume ?? "Parcours généré pour atteindre votre objectif professionnel.",
        objectifMetier,
        niveauEvalue,
        modeleIA: MODEL,
        steps: normaliserEtapes(parsedRetry.steps, catalogue, niveauEvalue, objectifMetier),
      })
    }

    // Toujours rien → repli déterministe (l'étudiant n'est jamais bloqué)
    console.warn("[ai/pathway] Échec des deux tentatives → parcours de secours")
    const secours = parcoursDeSecours(catalogue, objectifMetier, niveauEvalue)
    return Response.json({
      ...secours,
      objectifMetier,
      niveauEvalue,
      modeleIA: "fallback",
      fallback: true,
    })
  } catch (err) {
    console.error("[ai/pathway] Erreur de génération :", err)
    const secours = parcoursDeSecours(catalogue, objectifMetier, niveauEvalue)
    return Response.json({
      ...secours,
      objectifMetier,
      niveauEvalue,
      modeleIA: "fallback",
      fallback: true,
    })
  }
}
