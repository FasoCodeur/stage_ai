"use client"

import { useEffect, useMemo, useState } from "react"
import { useUserStore } from "@/lib/stores/user-store"
import { useEnrollmentStore } from "@/lib/stores/enrollment-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { useSubscriptionStore } from "@/lib/stores/subscription-store"
import { usePurchaseStore } from "@/lib/stores/purchase-store"
import { useProgramStore } from "@/lib/stores/program-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Clock,
  CreditCard,
  BookOpen,
  LogIn,
  Loader2,
  Users,
  CalendarClock,
  Wallet,
  MoreHorizontal,
  PlusCircle,
  CalendarPlus,
  Ban,
  History,
  AlertCircle,
} from "lucide-react"

type PurchaseFilter = "all" | "abonnement" | "achat" | "programme" | "aucun"

function getPurchaseType(
  userId: string,
  subscriptions: { userId: string; status: string }[],
  purchases: { userId: string }[],
  programEnrollments: { userId: string; status: string }[]
): { label: string; color: string; key: Exclude<PurchaseFilter, "all"> } {
  const hasSub = subscriptions.find((s) => s.userId === userId && s.status === "active")
  if (hasSub) return { label: "Abonnement", color: "bg-blue-100 text-blue-700 border-blue-200", key: "abonnement" }
  const hasPurchases = purchases.some((p) => p.userId === userId)
  if (hasPurchases) return { label: "Achat direct", color: "bg-green-100 text-green-700 border-green-200", key: "achat" }
  const hasProgram = programEnrollments.some((e) => e.userId === userId && e.status === "active")
  if (hasProgram) return { label: "Programme", color: "bg-purple-100 text-purple-700 border-purple-200", key: "programme" }
  return { label: "Aucun", color: "bg-gray-100 text-gray-700 border-gray-200", key: "aucun" }
}

function getSubscription(
  userId: string,
  subscriptions: { userId: string; status: string; endDate: string; startDate: string }[]
) {
  return subscriptions.find((s) => s.userId === userId && s.status === "active")
}

function getRemainingDays(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return iso
  }
}

export default function AdminEtudiantsPage() {
  const { users, isLoading: loadingUsers, fetchUsers } = useUserStore()
  const { enrollments, fetchAllEnrollments } = useEnrollmentStore()
  const { courses, fetchCourses } = useCourseStore()
  const {
    subscriptions,
    fetchAllSubscriptions,
    createSubscription,
    updateSubscriptionApi,
    cancelSubscriptionApi,
  } = useSubscriptionStore()
  const { purchases, fetchAllPurchases } = usePurchaseStore()
  const { enrollments: programEnrollments, fetchEnrollmentsByUser } = useProgramStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>("all")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showCourses, setShowCourses] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchAllEnrollments(),
          fetchCourses(),
          fetchAllSubscriptions(),
          fetchAllPurchases(),
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchUsers, fetchAllEnrollments, fetchCourses, fetchAllSubscriptions, fetchAllPurchases])

  const students = useMemo(() => users.filter((u) => u.role === "etudiant"), [users])

  // Charge les inscriptions aux programmes (pour le badge "Programme")
  useEffect(() => {
    if (students.length === 0) return
    let cancelled = false
    Promise.all(students.map((s) => fetchEnrollmentsByUser(s.id).catch(() => []))).catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.map((s) => s.id).join(",")])

  const studentCourses = (userId: string) => {
    const courseEnrollments = enrollments.filter((e) => e.userId === userId)
    const allCourseIds = courseEnrollments.map((e) => e.courseId)
    return courses.filter((c) => allCourseIds.includes(c.id))
  }

  // ── Statistiques ──
  const activeSubs = subscriptions.filter(
    (s) => s.status === "active" && new Date(s.endDate) >= new Date()
  )
  const expiringSoon = activeSubs.filter((s) => getRemainingDays(s.endDate) <= 7)
  const monthlyRevenue = activeSubs.length * 35000

  // ── Filtres ──
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (purchaseFilter === "all") return true
    const type = getPurchaseType(s.id, subscriptions, purchases, programEnrollments)
    return type.key === purchaseFilter
  })

  // ── Actions abonnement ──
  const runAction = async (userId: string, fn: () => Promise<unknown>) => {
    setBusyUserId(userId)
    setActionError("")
    try {
      await fn()
    } catch (err: any) {
      setActionError(err.message || "Une erreur est survenue.")
    } finally {
      setBusyUserId(null)
    }
  }

  const handleActivate = (userId: string) =>
    runAction(userId, () => createSubscription(userId, "mensuel"))

  const handleExtend = (userId: string) =>
    runAction(userId, () => updateSubscriptionApi(userId, { extendMonths: 1 }))

  const handleCancel = (userId: string) =>
    runAction(userId, () => cancelSubscriptionApi(userId))

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des étudiants...
      </div>
    )
  }

  const selectedStudentData = users.find((u) => u.id === selectedStudent)
  const selectedStudentSubs = selectedStudent
    ? subscriptions.filter((s) => s.userId === selectedStudent)
    : []

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

      {/* Statistiques abonnements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Abonnements actifs</span>
                <span className="text-3xl font-bold text-foreground">{activeSubs.length}</span>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Expirent sous 7 jours</span>
                <span className="text-3xl font-bold text-foreground">{expiringSoon.length}</span>
              </div>
              <div className="size-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <CalendarClock className="size-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Revenus mensuels (abonnements)</span>
                <span className="text-3xl font-bold text-foreground">
                  {monthlyRevenue.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground">FCFA estimés</span>
              </div>
              <div className="size-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Wallet className="size-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Filtre par type d'achat */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Filtrer :</span>
        <Select value={purchaseFilter} onValueChange={(v) => setPurchaseFilter((v ?? "all") as PurchaseFilter)}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="abonnement">Abonnement</SelectItem>
            <SelectItem value="achat">Achat direct</SelectItem>
            <SelectItem value="programme">Programme</SelectItem>
            <SelectItem value="aucun">Aucun achat</SelectItem>
          </SelectContent>
        </Select>
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
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const myEnrollments = enrollments.filter((e) => e.userId === s.id)
                  const avg = myEnrollments.length > 0
                    ? Math.round(myEnrollments.reduce((a, e) => a + e.progress, 0) / myEnrollments.length)
                    : 0
                  const purchaseType = getPurchaseType(s.id, subscriptions, purchases, programEnrollments)
                  const sub = getSubscription(s.id, subscriptions)
                  const remainingDays = sub ? getRemainingDays(sub.endDate) : null
                  const myCourses = studentCourses(s.id)
                  const busy = busyUserId === s.id

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
                          {s.lastLogin ? formatDate(s.lastLogin) : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${purchaseType.color}`}>
                          <CreditCard className="size-2.5 inline mr-0.5" />
                          {purchaseType.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub && remainingDays !== null ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  remainingDays <= 7
                                    ? "border-warning/40 bg-warning/10 text-warning"
                                    : "border-green-300 bg-green-50 text-green-700"
                                }`}
                              >
                                <Clock className="size-2.5 mr-0.5" />
                                {remainingDays} j restants
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowCourses(s.id)}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <BookOpen className="size-3.5" />
                          {myCourses.length} cours
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={avg} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{avg}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={busy}
                            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                          >
                            {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem onClick={() => setSelectedStudent(s.id)}>
                              <History />
                              Historique abonnements
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!sub && (
                              <DropdownMenuItem onClick={() => handleActivate(s.id)}>
                                <PlusCircle />
                                Activer un abonnement
                              </DropdownMenuItem>
                            )}
                            {sub && (
                              <DropdownMenuItem onClick={() => handleExtend(s.id)}>
                                <CalendarPlus />
                                Prolonger d'1 mois
                              </DropdownMenuItem>
                            )}
                            {sub && (
                              <DropdownMenuItem onClick={() => handleCancel(s.id)} className="text-destructive">
                                <Ban />
                                Annuler l'abonnement
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      <Dialog open={!!showCourses} onOpenChange={() => setShowCourses(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cours suivis — {users.find((u) => u.id === showCourses)?.name || ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {showCourses && studentCourses(showCourses).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun cours suivi pour le moment.</p>
            ) : showCourses && studentCourses(showCourses).map((course) => {
              const courseEnrollment = enrollments.find((e) => e.userId === showCourses && e.courseId === course.id)
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

      {/* Modal: Historique des abonnements */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abonnements — {selectedStudentData?.name || ""}</DialogTitle>
            <DialogDescription>
              Historique complet des abonnements de cet étudiant.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {selectedStudentSubs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <p className="text-sm text-muted-foreground text-center">
                  Aucun abonnement pour le moment.
                </p>
                {selectedStudent && (
                  <button
                    onClick={() => handleActivate(selectedStudent)}
                    disabled={busyUserId === selectedStudent}
                    className={buttonVariants({ size: "sm" })}
                  >
                    {busyUserId === selectedStudent ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <PlusCircle className="size-3.5" />
                    )}
                    Activer un abonnement mensuel
                  </button>
                )}
              </div>
            ) : (
              selectedStudentSubs.map((sub, idx) => {
                const isActive = sub.status === "active" && new Date(sub.endDate) >= new Date()
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground capitalize">{sub.plan}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isActive
                              ? "border-green-300 bg-green-50 text-green-700"
                              : "border-gray-300 bg-gray-50 text-gray-500"
                          }`}
                        >
                          {isActive ? "Actif" : "Expiré"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                        {isActive && ` (${getRemainingDays(sub.endDate)} j restants)`}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {selectedStudent && selectedStudentSubs.length > 0 && (
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => handleExtend(selectedStudent)}
                disabled={busyUserId === selectedStudent}
                className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1" })}
              >
                {busyUserId === selectedStudent ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CalendarPlus className="size-3.5" />
                )}
                Prolonger d'1 mois
              </button>
              <button
                onClick={() => handleCancel(selectedStudent)}
                disabled={busyUserId === selectedStudent}
                className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1 text-destructive" })}
              >
                <Ban className="size-3.5" />
                Annuler
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}