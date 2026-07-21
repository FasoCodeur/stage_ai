import { gateway, generateText } from "ai"

export async function POST(req: Request) {
  const { enrollments, courses } = await req.json()

  const prompt = `Tu es un conseiller pédagogique IA. Analyse la progression de cet étudiant et donne des conseils personnalisés.

Données de progression :
${enrollments
  .map(
    (e: { courseTitle: string; progress: number; completedLessons: number; totalLessons: number }) =>
      `- ${e.courseTitle} : ${e.progress}% complété (${e.completedLessons}/${e.totalLessons} leçons)`
  )
  .join("\n")}

Cours disponibles non commencés :
${courses
  .map((c: { title: string; category: string; level: string }) => `- ${c.title} (${c.category}, niveau ${c.level})`)
  .join("\n")}

Génère une analyse courte en JSON avec exactement cette structure :
{
  "score": <score global de progression de 0 à 100>,
  "status": "<Excellent|Bien|Moyen|A améliorer>",
  "insight": "<une phrase d'analyse principale sur la progression>",
  "conseil": "<un conseil actionnable concret pour progresser>",
  "prochaineCible": "<nom du cours ou leçon à cibler en priorité>"
}

Réponds uniquement avec le JSON, sans aucun texte autour.`

  try {
    const { text } = await generateText({
      model: gateway("anthropic/claude-haiku-4.5"),
      prompt,
    })

    const json = JSON.parse(text.trim())
    return Response.json(json)
  } catch {
    return Response.json({
      score: 45,
      status: "Moyen",
      insight: "Vous avez commencé plusieurs formations, continuez sur votre lancée.",
      conseil: "Essayez de compléter au moins une leçon par jour pour maintenir votre rythme.",
      prochaineCible: "Continuez votre formation en cours",
    })
  }
}
