"use client"

import { useState } from "react"
import { USERS, ENROLLMENTS, COURSES, SUBSCRIPTIONS, PURCHASES, PROGRAM_ENROLLMENTS, LEVELS } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, Clock, CreditCard, BookOpen, LogIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const students = USERS.filter((u) => u.role === "etudiant")

function getPurchaseType(userId: string): { label: string; color: string } {
  const hasSub = SUBSCRIPTIONS.find((s) => s.userId === userId && s.status === "active")
  if (hasSub) return { label: "Abonnement", color: "bg-blue-100 text-blue-700 border-blue-200" }
  const hasPurchases = PURCHASES.some((p) => p.userId === userId)
  if (hasPurchases) return { label: "Achat direct", color: "bg-green-100 text-green-700 border-green-200" }
  const hasProgram = PROGRAM_ENROLLMENTS.some((e) => e.userId === userId && e.status === "active")
  if (hasProgram) return { label: "Programme", color: "bg-purple-100 text-purple-700 border-purple-200" }
  return { label: "Aucun", color: "bg-gray-100 text-gray-700 border-gray-200" }
}

function getRemainingDays(userId: string): number | null {
  const sub = SUBSCRIPTIONS.find((s) => s.userId === userId && s.status === "active")
  if (!sub) return null
  const end = new Date(sub.endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function getStudentCourses(userId: string) {
  const courseEnrollments = ENROLLMENTS.filter((e) => e.userId === userId)
  const programCompletedCourses = PROGRAM_ENROLLMENTS.filter((e) => e.userId === userId)
    .flatMap((e) => e.completedCourses)
  const allCourseIds = [...new Set([...courseEnrollments.map((e) => e.courseId), ...programCompletedCourses])]
  return COURSES.filter((c) => allCourseIds.includes(c.id))
}

export default function AdminEtudiantsPage() {
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Étudiants</h1>
          <p className="text-sm text-muted-foreground mt-1">{students.length} étudiants inscrits</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Étudiant</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Dernière connexion</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Type d'achat</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Abonnement</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Cours suivis</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Progression moy.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const myEnrollments = ENROLLMENTS.filter((e) => e.userId === s.id)
                  const avg = myEnrollments.length > 0
                    ? Math.round(myEnrollments.reduce((a, e) => a + e.progress, 0) / myEnrollments.length)
                    : 0
                  const purchaseType = getPurchaseType(s.id)
                  const remainingDays = getRemainingDays(s.id)
                  const studentCourses = getStudentCourses(s.id)

                  return (
                    <tr key={s.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <LogIn className="size-3.5" />
                          {s.lastLogin || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${purchaseType.color}`}>
                          <CreditCard className="size-2.5 inline mr-0.5" />
                          {purchaseType.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {remainingDays !== null ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            {remainingDays} jours
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedStudent(s.id)}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <BookOpen className="size-3.5" />
                          {studentCourses.length} cours
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={avg} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{avg}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Aucun étudiant trouvé</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Détail des cours suivis */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cours suivis — {USERS.find((u) => u.id === selectedStudent)?.name || ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {selectedStudent && getStudentCourses(selectedStudent).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun cours suivi pour le moment.</p>
            ) : selectedStudent && getStudentCourses(selectedStudent).map((course) => {
              const courseEnrollment = ENROLLMENTS.find((e) => e.userId === selectedStudent && e.courseId === course.id)
              return (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <span className="text-2xl">{course.thumbnail}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{course.duration}h</span>
                      <span>•</span>
                      <span>{course.category}</span>
                      {courseEnrollment && (
                        <>
                          <span>•</span>
                          <span>Progression: {courseEnrollment.progress}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}