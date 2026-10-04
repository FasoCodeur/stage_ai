"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, FilePlus2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function TuteurHomePage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Espace Entreprise Partenaire</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenue {user?.name}. Publiez des offres de stage et suivez vos stagiaires virtuels.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FilePlus2 className="size-8 text-primary" />
            <div>
              <p className="font-semibold">Publier une offre</p>
              <p className="text-sm text-muted-foreground">Soumettez une nouvelle mission de stage pour recruter.</p>
            </div>
            <Link href="/tuteur/offres/nouvelle">
              <Button className="w-full">
                <PlusCircle className="size-4" /> Nouvelle offre
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FilePlus2 className="size-8 text-primary" />
            <div>
              <p className="font-semibold">Mes offres</p>
              <p className="text-sm text-muted-foreground">Suivez le statut de validation de vos offres.</p>
            </div>
            <Link href="/tuteur/offres">
              <Button className="w-full" variant="outline">
                Voir mes offres <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <Users className="size-8 text-primary" />
            <div>
              <p className="font-semibold">Mes stagiaires</p>
              <p className="text-sm text-muted-foreground">Accédez aux espaces de vos stagiaires pour évaluer leurs livrables.</p>
            </div>
            <Link href="/tuteur/stages">
              <Button className="w-full" variant="outline">
                Suivre mes stagiaires <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}