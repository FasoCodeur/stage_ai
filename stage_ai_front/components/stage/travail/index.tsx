"use client"

import { Suspense, lazy, type ComponentType } from "react"
import { Loader2 } from "lucide-react"

interface TravailProps {
  stage: any
}

// Registre de composants dynamiques par domaine (évite les conditions en cascade)
const registry: Record<string, ComponentType<TravailProps>> = {
  dev_web: lazy(() => import("./DevWebTravail")),
  data_analyst: lazy(() => import("./DataAnalystTravail")),
  finance: lazy(() => import("./FinanceTravail")),
  marketing: lazy(() => import("./MarketingTravail")),
  design: lazy(() => import("./DesignTravail")),
}

export default function TravailTab({ stage }: TravailProps) {
  const domain = (stage?.domainData?.domaine as string) || (stage?.missionCourante?.domainData?.domaine as string) || "dev_web"
  const Component = registry[domain] ?? registry.dev_web

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
          <Loader2 className="size-5 animate-spin" />
          Chargement de l'espace de travail...
        </div>
      }
    >
      <Component stage={stage} />
    </Suspense>
  )
}