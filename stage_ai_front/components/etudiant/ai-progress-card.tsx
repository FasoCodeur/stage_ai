"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, Target, Lightbulb, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIProgressInsight {
  score: number
  status: "Excellent" | "Bien" | "Moyen" | "A améliorer"
  insight: string
  conseil: string
  prochaineCible: string
}

interface Enrollment {
  courseTitle: string
  progress: number
  completedLessons: number
  totalLessons: number
}

interface Course {
  title: string
  category: string
  level: string
}

interface AIProgressCardProps {
  enrollments: Enrollment[]
  availableCourses: Course[]
}

const STATUS_COLORS: Record<string, string> = {
  Excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Bien: "text-blue-600 bg-blue-50 border-blue-200",
  Moyen: "text-amber-600 bg-amber-50 border-amber-200",
  "A améliorer": "text-red-600 bg-red-50 border-red-200",
}

const STATUS_BAR: Record<string, string> = {
  Excellent: "bg-emerald-500",
  Bien: "bg-blue-500",
  Moyen: "bg-amber-500",
  "A améliorer": "bg-red-400",
}

export function AIProgressCard({ enrollments, availableCourses }: AIProgressCardProps) {
  const [insight, setInsight] = useState<AIProgressInsight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/ai-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollments, courses: availableCourses }),
        })
        const data = await res.json()
        setInsight(data)
      } catch {
        setInsight({
          score: 50,
          status: "Moyen",
          insight: "Continuez à apprendre pour progresser.",
          conseil: "Essayez de compléter une leçon par jour.",
          prochaineCible: "Votre cours en cours",
        })
      } finally {
        setLoading(false)
      }
    }
    if (enrollments.length > 0) fetchInsight()
    else setLoading(false)
  }, [])

  if (enrollments.length === 0) return null

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-primary/3">
        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Analyse IA de votre progression</p>
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          Mis a jour maintenant
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Analyse en cours...</span>
        </div>
      ) : insight ? (
        <div className="p-4 flex flex-col gap-4">
          {/* Score + status */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center size-16 rounded-2xl bg-muted shrink-0">
              <span className="text-2xl font-bold text-foreground leading-none">{insight.score}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", STATUS_COLORS[insight.status] ?? "text-muted-foreground bg-muted border-border")}>
                  {insight.status}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", STATUS_BAR[insight.status] ?? "bg-primary")}
                  style={{ width: `${insight.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5">
            <TrendingUp className="size-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground leading-relaxed">{insight.insight}</p>
          </div>

          {/* Conseil */}
          <div className="flex items-start gap-2.5 rounded-xl border border-chart-3/20 bg-chart-3/5 px-3 py-2.5">
            <Lightbulb className="size-3.5 text-chart-3 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground leading-relaxed">{insight.conseil}</p>
          </div>

          {/* Prochaine cible */}
          <div className="flex items-center gap-2.5">
            <Target className="size-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Cible prioritaire :{" "}
              <span className="font-medium text-foreground">{insight.prochaineCible}</span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
