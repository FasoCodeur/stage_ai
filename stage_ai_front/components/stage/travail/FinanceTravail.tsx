"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Wallet } from "lucide-react"

interface FinanceTravailProps {
  stage: any
}

export default function FinanceTravail({ stage }: FinanceTravailProps) {
  const initial = (stage?.missionCourante?.domainData?.contenu as string) || ""
  const [contenu, setContenu] = useState(initial)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Wallet className="size-4" />
        <CardTitle className="text-base">Analyse & rédaction financière</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="min-h-[250px]"
          placeholder="Rédigez votre analyse, budget, prévisionnel ici..."
        />
        <div className="flex gap-2">
          <Button size="sm">
            <Save className="size-4" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}