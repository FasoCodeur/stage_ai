"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, FileCode, Play } from "lucide-react"

interface DevWebTravailProps {
  stage: any
}

export default function DevWebTravail({ stage }: DevWebTravailProps) {
  const initial = (stage?.missionCourante?.domainData?.code as string) || "// Votre code ici\n"
  const [code, setCode] = useState(initial)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <FileCode className="size-4" />
        <CardTitle className="text-base">Éditeur de code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
          placeholder="Écrivez votre code ici..."
        />
        <div className="flex gap-2">
          <Button size="sm">
            <Save className="size-4" />
            Enregistrer
          </Button>
          <Button size="sm" variant="outline">
            <Play className="size-4" />
            Exécuter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}