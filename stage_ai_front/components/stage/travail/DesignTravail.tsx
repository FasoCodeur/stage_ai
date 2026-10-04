"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Palette } from "lucide-react"

interface DesignTravailProps {
  stage: any
}

export default function DesignTravail({ stage }: DesignTravailProps) {
  const initial = (stage?.missionCourante?.domainData?.description as string) || ""
  const [description, setDescription] = useState(initial)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Palette className="size-4" />
        <CardTitle className="text-base">Aperçu & direction artistique</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border-2 border-dashed p-8 aspect-video flex items-center justify-center bg-muted/30">
          <p className="text-sm text-muted-foreground">Aperçu visuel du design (maquette ici)</p>
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px]"
          placeholder="Description de la direction artistique, palette, concepts..."
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