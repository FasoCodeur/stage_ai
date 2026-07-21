"use client"

import { useAuth } from "@/lib/auth-context"
import { COURSES } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { PlusCircle, Edit, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function ProfCourseListPage() {
  const { user } = useAuth()
  const myCourses = COURSES.filter((c) => c.professorId === user?.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes cours</h1>
          <p className="text-sm text-muted-foreground mt-1">{myCourses.length} cours créés</p>
        </div>
        <Link href="/professeur/cours/nouveau" className={buttonVariants({ variant: "default" })}>
          <PlusCircle />
          Nouveau cours
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myCourses.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="h-28 bg-primary/5 flex items-center justify-center border-b">
              <span className="text-5xl">{c.thumbnail}</span>
            </div>
            <CardContent className="pt-4 pb-4 flex flex-col gap-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
                  <Badge variant={c.published ? "default" : "secondary"} className="text-xs shrink-0">
                    {c.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  {c.students.length} étudiant{c.students.length > 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {c.duration}h
                </div>
                <Badge variant="outline" className="text-xs ml-auto">{c.level}</Badge>
              </div>

              <Link href={`/professeur/cours/${c.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
                <Edit />
                Modifier le cours
              </Link>
            </CardContent>
          </Card>
        ))}

        {/* New course card */}
        <Link href="/professeur/cours/nouveau">
          <div className="rounded-xl border-2 border-dashed border-border h-full min-h-60 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer p-6">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PlusCircle className="size-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Créer un nouveau cours</p>
            <p className="text-xs text-muted-foreground text-center">Modules, leçons, quiz et sandbox intégrés</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
