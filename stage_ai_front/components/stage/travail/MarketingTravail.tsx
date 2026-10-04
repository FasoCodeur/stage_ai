"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Megaphone } from "lucide-react"

interface MarketingTravailProps {
  stage: any
}

export default function MarketingTravail({ stage }: MarketingTravailProps) {
  const initial = (stage?.missionCourante?.domainData?.plan as string) || ""
  const [plan, setPlan] = useState(initial)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Megaphone className="size-4" />
        <CardTitle className="text-base">Planning marketing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="min-h-[250px]"
          placeholder="Rédigez votre planning de campagne, contenus, canaux..."
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