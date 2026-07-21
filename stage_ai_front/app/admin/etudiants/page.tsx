"use client"

import { USERS, ENROLLMENTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

const students = USERS.filter((u) => u.role === "etudiant")

export default function AdminEtudiantsPage() {
  const [search, setSearch] = useState("")

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Etudiants</h1>
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
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Etudiant</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Ville</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Niveau</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Cours suivis</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Progression moy.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const myEnrollments = ENROLLMENTS.filter((e) => e.userId === s.id)
                  const avg =
                    myEnrollments.length > 0
                      ? Math.round(myEnrollments.reduce((a, e) => a + e.progress, 0) / myEnrollments.length)
                      : 0
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
                      <td className="px-4 py-3 text-foreground">{s.ville || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{s.niveau || "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">{myEnrollments.length}</td>
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
    </div>
  )
}
