"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { COURSES, ENROLLMENTS, USERS, isCourseNew, hasAccess, getSubscription, Course, Enrollment } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Clock,
  Users,
  Sparkles,
  Lock,
  Phone,
  Crown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  BookOpen,
  LayoutGrid,
  List,
  Star,
  Layers,
  TrendingUp,
  X,
} from "lucide-react"
import Link from "next/link"
import { OrangeMoneyModal } from "@/components/etudiant/orange-money-modal"

const ALL = "all"

type SortOption = "relevance" | "newest" | "price-asc" | "price-desc" | "students" | "duration"
type ViewMode = "grid" | "list"

function getLessonCount(course: Course) {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
}

function CourseCard({
  c,
  isEnrolled,
  enrollment,
  hasAccess: access,
  onPurchase,
  viewMode,
}: {
  c: Course
  isEnrolled: boolean
  enrollment?: Enrollment
  hasAccess: boolean
  onPurchase: (course: Course) => void
  viewMode: ViewMode
}) {
  const isNew = isCourseNew(c)
  const isBestSeller = c.students.length >= 3
  const professor = USERS.find((u) => u.id === c.professorId)
  const lessonCount = getLessonCount(c)

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden flex flex-col sm:flex-row relative">
        {isNew && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-chart-3 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            <Sparkles className="size-2.5" />
            Nouveau
          </span>
        )}
        {!access && (
          <div className="absolute inset-0 z-10 rounded-[inherit] bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Lock className="size-6 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Accès restreint</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Abonnez-vous ou achetez ce cours</p>
            </div>
          </div>
        )}
        <div className="sm:w-48 h-28 sm:h-auto bg-primary/5 flex items-center justify-center border-b sm:border-b-0 sm:border-r shrink-0">
          <span className="text-5xl">{c.thumbnail}</span>
        </div>
        <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
                {isBestSeller && (
                  <Badge className="bg-orange-500 text-white text-[10px] gap-1 px-1.5">
                    <TrendingUp className="size-2.5" />
                    Best-seller
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">{c.description}</p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0 self-start">{c.level}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</div>
            <div className="flex items-center gap-1"><Layers className="size-3" />{c.modules.length} modules</div>
            <div className="flex items-center gap-1"><BookOpen className="size-3" />{lessonCount} leçons</div>
            <div className="flex items-center gap-1"><Users className="size-3" />{c.students.length} inscrits</div>
            <div className="flex items-center gap-1"><Star className="size-3 fill-yellow-400 text-yellow-400" />4.8</div>
            {professor && <span>Par {professor.name}</span>}
            <span className="font-semibold text-foreground ml-auto">{c.price.toLocaleString("fr-FR")} FCFA</span>
          </div>

          {access && isEnrolled && enrollment && (
            <div className="flex flex-col gap-1 max-w-md">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span>{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-1.5" />
            </div>
          )}

          <div className="mt-auto flex flex-col sm:flex-row gap-2">
            {access ? (
              <Link
                href={`/etudiant/cours/${c.id}`}
                className={buttonVariants({ size: "sm", variant: isEnrolled ? "default" : "outline", className: "w-full sm:w-fit" })}
              >
                <Play className="size-3" />
                {isEnrolled ? (enrollment && enrollment.progress > 0 ? "Continuer" : "Commencer") : "Commencer"}
              </Link>
            ) : (
              <button
                onClick={() => onPurchase(c)}
                className="inline-flex w-full sm:w-fit items-center justify-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/8 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500/15 transition-colors h-8"
              >
                <Phone className="size-3" />
                Acheter via Orange Money
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col relative">
      {isNew && (
        <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-chart-3 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <Sparkles className="size-2.5" />
          Nouveau
        </span>
      )}
      {isBestSeller && (
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <TrendingUp className="size-2.5" />
          Best-seller
        </span>
      )}
      {!access && (
        <div className="absolute inset-0 z-10 rounded-[inherit] bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Lock className="size-6 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">Accès restreint</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Abonnez-vous ou achetez ce cours</p>
          </div>
        </div>
      )}
      <div className="h-28 bg-primary/5 flex items-center justify-center border-b">
        <span className="text-5xl">{c.thumbnail}</span>
      </div>
      <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
            <Badge variant="outline" className="text-xs shrink-0">{c.level}</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</div>
          <div className="flex items-center gap-1"><Users className="size-3" />{c.students.length} inscrits</div>
          <div className="flex items-center gap-1"><Star className="size-3 fill-yellow-400 text-yellow-400" />4.8</div>
        </div>

        {access && isEnrolled && enrollment && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-1.5" />
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {access ? (
            <Link
              href={`/etudiant/cours/${c.id}`}
              className={buttonVariants({ size: "sm", variant: isEnrolled ? "default" : "outline", className: "w-full" })}
            >
              <Play className="size-3" />
              {isEnrolled ? (enrollment && enrollment.progress > 0 ? "Continuer" : "Commencer") : "Commencer"}
            </Link>
          ) : (
            <button
              onClick={() => onPurchase(c)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/8 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500/15 transition-colors h-8"
            >
              <Phone className="size-3" />
              Acheter via Orange Money
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FormationsPage() {
  const { user } = useAuth()
  const [purchaseCourse, setPurchaseCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>(ALL)
  const [level, setLevel] = useState<string>(ALL)
  const [sort, setSort] = useState<SortOption>("relevance")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const myEnrollments = ENROLLMENTS.filter((e) => e.userId === user?.id)
  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))

  const subscription = user ? getSubscription(user.id) : null
  const publishedCourses = COURSES.filter((c) => c.published)

  const categories = useMemo(
    () => Array.from(new Set(publishedCourses.map((c) => c.category))).sort(),
    [publishedCourses]
  )
  const levels = useMemo(
    () => Array.from(new Set(publishedCourses.map((c) => c.level))).sort(),
    [publishedCourses]
  )

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = publishedCourses.filter((c) => {
      const matchesSearch =
        !term ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      const matchesCategory = category === ALL || c.category === category
      const matchesLevel = level === ALL || c.level === level
      return matchesSearch && matchesCategory && matchesLevel
    })

    switch (sort) {
      case "newest":
        result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "price-asc":
        result = result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result = result.sort((a, b) => b.price - a.price)
        break
      case "students":
        result = result.sort((a, b) => b.students.length - a.students.length)
        break
      case "duration":
        result = result.sort((a, b) => a.duration - b.duration)
        break
      default:
        break
    }

    return result
  }, [publishedCourses, search, category, level, sort])

  const newCourses = filteredCourses.filter((c) => isCourseNew(c))
  const otherCourses = filteredCourses.filter((c) => !isCourseNew(c))

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const hasFilters = search.trim() || category !== ALL || level !== ALL || sort !== "relevance"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Toutes les formations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCourses.length} formation{filteredCourses.length > 1 ? "s" : ""} disponible{filteredCourses.length > 1 ? "s" : ""}
          </p>
        </div>

        {subscription ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/6 px-4 py-2 text-sm">
            <Crown className="size-4 text-primary" />
            <div>
              <span className="font-semibold text-foreground text-xs">Abonnement actif</span>
              <span className="block text-[11px] text-muted-foreground">{daysLeft} jours restants</span>
            </div>
          </div>
        ) : (
          <Link
            href="/etudiant/abonnement"
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/6 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-500/12 transition-colors"
          >
            <Phone className="size-3.5" />
            S'abonner — 35 000 FCFA/mois
            <ChevronRight className="size-3" />
          </Link>
        )}
      </div>

      {/* Search & filters */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une formation, un sujet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <BookOpen className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les niveaux</SelectItem>
              {levels.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {lvl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <TrendingUp className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Pertinence</SelectItem>
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="students">Plus populaire</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg h-9 p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center rounded-md px-2.5 h-full transition-colors ${
                viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grille"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center rounded-md px-2.5 h-full transition-colors ${
                viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Liste"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border rounded-xl bg-muted/20">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucune formation trouvée</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Essayez un autre mot-clé ou réinitialisez les filtres.
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("")
                setCategory(ALL)
                setLevel(ALL)
                setSort("relevance")
              }}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          {newCourses.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-chart-3" />
                <h2 className="text-base font-semibold text-foreground">Nouvelles formations</h2>
                <Badge className="bg-chart-3 text-white text-xs">
                  {newCourses.length} nouveau{newCourses.length > 1 ? "x" : ""}
                </Badge>
              </div>
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                {newCourses.map((c) => (
                  <CourseCard
                    key={c.id}
                    c={c}
                    isEnrolled={enrolledIds.has(c.id)}
                    enrollment={myEnrollments.find((e) => e.courseId === c.id)}
                    hasAccess={user ? hasAccess(user.id, c.id) : false}
                    onPurchase={setPurchaseCourse}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-foreground">
              {search.trim() || category !== ALL || level !== ALL ? "Résultats" : "Catalogue"}
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
              {otherCourses.map((c) => (
                <CourseCard
                  key={c.id}
                  c={c}
                  isEnrolled={enrolledIds.has(c.id)}
                  enrollment={myEnrollments.find((e) => e.courseId === c.id)}
                  hasAccess={user ? hasAccess(user.id, c.id) : false}
                  onPurchase={setPurchaseCourse}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {purchaseCourse && (
        <OrangeMoneyModal
          course={purchaseCourse}
          open={!!purchaseCourse}
          onClose={() => setPurchaseCourse(null)}
        />
      )}
    </div>
  )
}
