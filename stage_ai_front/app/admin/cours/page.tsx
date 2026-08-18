"use client"

import { useEffect, useState } from "react"
import { useCourseStore } from "@/lib/stores/course-store"
import { useUserStore } from "@/lib/stores/user-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Loader2 } from "lucide-react"

export default function AdminCoursPage() {
  const { courses, fetchCourses } = useCourseStore()
  const { users, fetchUsers } = useUserStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchCourses(), fetchUsers()])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchCourses, fetchUsers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des cours...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cours</h1>
        <p className="text-sm text-muted-foreground mt-1">{courses.length} cours sur la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => {
          const prof = users.find((u) => u.id === c.professorId)
          return (
            <Card key={c.id} className="overflow-hidden">
              <div className="h-24 bg-primary/5 flex items-center justify-center border-b">
                <span className="text-4xl">{c.thumbnail}</span>
              </div>
              <CardContent className="pt-3 pb-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
                  <Badge variant={c.published ? "default" : "secondary"} className="text-xs shrink-0">
                    {c.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1"><Users className="size-3" />{(c.students?.length || 0)}</div>
                  <div className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</div>
                  <Badge variant="outline" className="text-xs ml-auto">{c.level}</Badge>
                </div>
                {prof && <p className="text-xs text-muted-foreground">Professeur : {prof.name}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
