"use client"

import { useAuth } from "@/lib/auth-context"
import { COURSES, ENROLLMENTS, USERS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ProfEtudiantsPage() {
  const { user } = useAuth()
  const myCourses = COURSES.filter((c) => c.professorId === user?.id)
  const myEnrollments = ENROLLMENTS.filter((e) => myCourses.some((c) => c.id === e.courseId))

  // Group by student
  const studentMap: Record<string, { name: string; avatar: string; enrollments: typeof myEnrollments }> = {}
  myEnrollments.forEach((e) => {
    const s = USERS.find((u) => u.id === e.userId)
    if (!s) return
    if (!studentMap[s.id]) studentMap[s.id] = { name: s.name, avatar: s.avatar, enrollments: [] }
    studentMap[s.id].enrollments.push(e)
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes étudiants</h1>
        <p className="text-sm text-muted-foreground mt-1">{Object.keys(studentMap).length} étudiants dans vos cours</p>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(studentMap).map(([id, data]) => {
          const avg = Math.round(data.enrollments.reduce((a, e) => a + e.progress, 0) / data.enrollments.length)
          return (
            <Card key={id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{data.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{data.name}</p>
                      <Badge variant="outline" className="text-xs">{data.enrollments.length} cours</Badge>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {data.enrollments.map((e) => {
                        const course = myCourses.find((c) => c.id === e.courseId)
                        if (!course) return null
                        return (
                          <div key={e.courseId} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-36 truncate">{course.title}</span>
                            <Progress value={e.progress} className="flex-1 h-1.5" />
                            <span className="text-xs text-muted-foreground w-8 text-right">{e.progress}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold text-foreground">{avg}%</p>
                    <p className="text-xs text-muted-foreground">moy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
