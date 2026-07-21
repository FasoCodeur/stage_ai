import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
  gateway,
} from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, courseTitle, lessonTitle }: { messages: UIMessage[]; courseTitle?: string; lessonTitle?: string } =
    await req.json()

  const systemPrompt = `Tu es StageAI, un tuteur pédagogique intelligent qui aide les étudiants africains à apprendre les compétences numériques.

Ton rôle :
- Expliquer clairement les concepts du cours en cours
- Répondre aux questions de l'étudiant sur le contenu
- Donner des exemples pratiques adaptés au contexte africain
- Encourager et motiver l'étudiant
- Corriger les incompréhensions avec bienveillance
- Suggérer des exercices pratiques quand c'est pertinent

${courseTitle ? `L'étudiant suit actuellement le cours : "${courseTitle}"` : ""}
${lessonTitle ? `La leçon en cours : "${lessonTitle}"` : ""}

Règles importantes :
- Réponds toujours en français
- Sois concis et pédagogique (max 3-4 paragraphes)
- Utilise des exemples concrets du quotidien africain quand possible
- Si la question n'est pas liée au cours, ramène doucement sur le sujet
- Tu peux utiliser des emojis pour rendre la conversation plus vivante`

  const result = streamText({
    model: gateway("anthropic/claude-haiku-4.5"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
