"use client"

import { useState } from "react"
import { Course, Module, Lesson, QuizQuestion } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  PlusCircle,
  Trash2,
  ChevronRight,
  FileText,
  Video,
  CheckSquare,
  Code2,
  GripVertical,
  Save,
  Eye,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type LessonType = Lesson["type"]

const LESSON_TYPE_CONFIG: Record<LessonType, { label: string; icon: React.ElementType; color: string }> = {
  texte: { label: "Texte", icon: FileText, color: "text-primary" },
  video: { label: "Vidéo", icon: Video, color: "text-chart-2" },
  quiz: { label: "Quiz", icon: CheckSquare, color: "text-chart-3" },
  sandbox: { label: "Sandbox", icon: Code2, color: "text-warning" },
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Quiz Editor ───────────────────────────────────────────────────────────────
function QuizEditor({ quiz, onChange }: { quiz: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const addQuestion = () => {
    onChange([...quiz, { id: generateId(), question: "", options: ["", "", "", ""], correctIndex: 0 }])
  }
  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: unknown) => {
    const updated = quiz.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    onChange(updated)
  }
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = quiz.map((q, i) => {
      if (i !== qIdx) return q
      const options = [...q.options]
      options[oIdx] = value
      return { ...q, options }
    })
    onChange(updated)
  }
  const removeQuestion = (idx: number) => onChange(quiz.filter((_, i) => i !== idx))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Questions ({quiz.length})</p>
        <Button size="sm" variant="outline" onClick={addQuestion}>
          <PlusCircle />
          Ajouter une question
        </Button>
      </div>
      {quiz.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          Aucune question. Cliquez sur &ldquo;Ajouter une question&rdquo;.
        </div>
      )}
      {quiz.map((q, qIdx) => (
        <Card key={q.id} className="border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Question {qIdx + 1}</Label>
                  <Input
                    placeholder="Entrez votre question..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIdx)} className="text-destructive mt-5 shrink-0">
                  <Trash2 />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                      className={cn(
                        "size-5 rounded-full border-2 shrink-0 transition-colors",
                        q.correctIndex === oIdx ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}
                      aria-label={`Marquer option ${oIdx + 1} comme correcte`}
                    />
                    <Input
                      placeholder={`Option ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                      className="text-sm h-8"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Cliquez sur le cercle pour marquer la bonne réponse (option {q.correctIndex + 1} sélectionnée)
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Lesson Editor ─────────────────────────────────────────────────────────────
function LessonEditor({ lesson, onChange }: { lesson: Lesson; onChange: (l: Lesson) => void }) {
  const TypeIcon = LESSON_TYPE_CONFIG[lesson.type].icon

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <TypeIcon className={cn("size-4", LESSON_TYPE_CONFIG[lesson.type].color)} />
        <span className="text-sm font-medium text-foreground">Leçon — {LESSON_TYPE_CONFIG[lesson.type].label}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-title">Titre de la leçon</Label>
        <Input
          id="lesson-title"
          value={lesson.title}
          onChange={(e) => onChange({ ...lesson, title: e.target.value })}
          placeholder="Titre de la leçon..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-type">Type de leçon</Label>
        <Select
          value={lesson.type}
          onValueChange={(v) => onChange({ ...lesson, type: v as LessonType })}
        >
          <SelectTrigger id="lesson-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(LESSON_TYPE_CONFIG) as LessonType[]).map((t) => {
              const cfg = LESSON_TYPE_CONFIG[t]
              return (
                <SelectItem key={t} value={t}>
                  <div className="flex items-center gap-2">
                    <cfg.icon className={cn("size-4", cfg.color)} />
                    {cfg.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-duration">Durée estimée (minutes)</Label>
        <Input
          id="lesson-duration"
          type="number"
          min={1}
          value={lesson.duration}
          onChange={(e) => onChange({ ...lesson, duration: parseInt(e.target.value) || 0 })}
        />
      </div>

      {lesson.type === "texte" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-content">Contenu (Markdown supporté)</Label>
          <Textarea
            id="lesson-content"
            rows={10}
            value={lesson.content}
            onChange={(e) => onChange({ ...lesson, content: e.target.value })}
            placeholder="Rédigez votre leçon ici... Le Markdown est supporté."
            className="font-mono text-sm"
          />
        </div>
      )}

      {lesson.type === "video" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="video-url">URL de la vidéo (YouTube embed ou lien direct)</Label>
            <Input
              id="video-url"
              value={lesson.videoUrl || ""}
              onChange={(e) => onChange({ ...lesson, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          {lesson.videoUrl && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title="Aperçu vidéo"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="video-desc">Description</Label>
            <Textarea
              id="video-desc"
              rows={3}
              value={lesson.content}
              onChange={(e) => onChange({ ...lesson, content: e.target.value })}
              placeholder="Description de la vidéo..."
            />
          </div>
        </div>
      )}

      {lesson.type === "quiz" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Introduction du quiz</Label>
            <Textarea
              rows={2}
              value={lesson.content}
              onChange={(e) => onChange({ ...lesson, content: e.target.value })}
              placeholder="Instructions pour les étudiants..."
            />
          </div>
          <Separator />
          <QuizEditor
            quiz={lesson.quiz || []}
            onChange={(q) => onChange({ ...lesson, quiz: q })}
          />
        </div>
      )}

      {lesson.type === "sandbox" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Instructions</Label>
            <Textarea
              rows={3}
              value={lesson.content}
              onChange={(e) => onChange({ ...lesson, content: e.target.value })}
              placeholder="Expliquez l'exercice aux étudiants..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sandbox-code">Code de départ (HTML/CSS/JS)</Label>
            <Textarea
              id="sandbox-code"
              rows={12}
              value={lesson.sandboxCode || ""}
              onChange={(e) => onChange({ ...lesson, sandboxCode: e.target.value })}
              placeholder="<!-- Entrez le code de départ pour l'exercice -->"
              className="font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Module tree item ───────────────────────────────────────────────────────────
function ModuleItem({
  module,
  isExpanded,
  onToggle,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleteLesson,
  onDeleteModule,
}: {
  module: Module
  isExpanded: boolean
  onToggle: () => void
  selectedLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onAddLesson: (moduleId: string) => void
  onDeleteLesson: (moduleId: string, lessonId: string) => void
  onDeleteModule: (moduleId: string) => void
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50">
        <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
        <button onClick={onToggle} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
          {isExpanded ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
          <span className="text-sm font-medium text-foreground truncate">{module.title || "Module sans titre"}</span>
        </button>
        <Badge variant="outline" className="text-xs shrink-0">{module.lessons.length}</Badge>
        <button
          onClick={() => onDeleteModule(module.id)}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
          aria-label="Supprimer le module"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Lessons */}
      {isExpanded && (
        <div className="flex flex-col">
          {module.lessons.map((lesson) => {
            const cfg = LESSON_TYPE_CONFIG[lesson.type]
            return (
              <div
                key={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectLesson(lesson.id)}
                onKeyDown={(e) => e.key === "Enter" && onSelectLesson(lesson.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 text-left hover:bg-accent transition-colors border-t cursor-pointer",
                  selectedLessonId === lesson.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <cfg.icon className={cn("size-3.5 shrink-0", cfg.color)} />
                <span className="text-sm text-foreground flex-1 truncate">{lesson.title || "Leçon sans titre"}</span>
                <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}min</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteLesson(module.id, lesson.id) }}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Supprimer la leçon"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            )
          })}
          <button
            onClick={() => onAddLesson(module.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors border-t"
          >
            <PlusCircle className="size-3.5" />
            Ajouter une leçon
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Course Editor ─────────────────────────────────────────────────────────
interface CourseEditorProps {
  initial: Course
  onSave: (course: Course) => void
}

export function CourseEditor({ initial, onSave }: CourseEditorProps) {
  const [course, setCourse] = useState<Course>(initial)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(initial.modules.map((m) => m.id)))
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    initial.modules[0]?.lessons[0]?.id ?? null
  )
  const [activeTab, setActiveTab] = useState<"structure" | "parametres">("structure")
  const [saved, setSaved] = useState(false)

  // ── Helpers ──
  const updateCourse = (patch: Partial<Course>) => setCourse((c) => ({ ...c, ...patch }))

  const selectedLesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId) ?? null
  const selectedModule = course.modules.find((m) => m.lessons.some((l) => l.id === selectedLessonId)) ?? null

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addModule = () => {
    const newModule: Module = { id: generateId(), title: `Module ${course.modules.length + 1}`, lessons: [] }
    setCourse((c) => ({ ...c, modules: [...c.modules, newModule] }))
    setExpandedModules((prev) => new Set([...prev, newModule.id]))
  }

  const updateModuleTitle = (moduleId: string, title: string) => {
    setCourse((c) => ({ ...c, modules: c.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)) }))
  }

  const deleteModule = (moduleId: string) => {
    setCourse((c) => ({ ...c, modules: c.modules.filter((m) => m.id !== moduleId) }))
    if (selectedModule?.id === moduleId) setSelectedLessonId(null)
  }

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: generateId(),
      title: "Nouvelle leçon",
      type: "texte",
      content: "",
      duration: 15,
    }
    setCourse((c) => ({
      ...c,
      modules: c.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    }))
    setSelectedLessonId(newLesson.id)
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse((c) => ({
      ...c,
      modules: c.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      ),
    }))
    if (selectedLessonId === lessonId) setSelectedLessonId(null)
  }

  const updateLesson = (updatedLesson: Lesson) => {
    setCourse((c) => ({
      ...c,
      modules: c.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)),
      })),
    }))
  }

  const handleSave = () => {
    onSave(course)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0)
  const totalDuration = course.modules
    .flatMap((m) => m.lessons)
    .reduce((a, l) => a + l.duration, 0)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-foreground truncate max-w-md">{course.title || "Nouveau cours"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {course.modules.length} module{course.modules.length > 1 ? "s" : ""} · {totalLessons} leçon{totalLessons > 1 ? "s" : ""} · {totalDuration} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="published" className="text-sm text-muted-foreground">Publié</Label>
            <Switch
              id="published"
              checked={course.published}
              onCheckedChange={(v) => updateCourse({ published: v })}
            />
          </div>
          <Button onClick={handleSave} variant={saved ? "outline" : "default"}>
            <Save />
            {saved ? "Sauvegardé !" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left — Structure */}
        <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("structure")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", activeTab === "structure" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            >
              <BookOpen className="size-3.5" />
              Structure
            </button>
            <button
              onClick={() => setActiveTab("parametres")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", activeTab === "parametres" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
            >
              Paramètres
            </button>
          </div>

          {activeTab === "structure" && (
            <>
              <div className="flex flex-col gap-2">
                {course.modules.map((module) => (
                  <div key={module.id} className="flex flex-col gap-1">
                    {/* Module title editable */}
                    <div className="px-1">
                      <Input
                        value={module.title}
                        onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                        className="h-7 text-xs font-semibold border-0 bg-transparent px-2 focus-visible:bg-muted"
                        placeholder="Titre du module..."
                      />
                    </div>
                    <ModuleItem
                      module={module}
                      isExpanded={expandedModules.has(module.id)}
                      onToggle={() => toggleModule(module.id)}
                      selectedLessonId={selectedLessonId}
                      onSelectLesson={setSelectedLessonId}
                      onAddLesson={addLesson}
                      onDeleteLesson={deleteLesson}
                      onDeleteModule={deleteModule}
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addModule} className="w-full">
                <PlusCircle />
                Ajouter un module
              </Button>
            </>
          )}

          {activeTab === "parametres" && (
            <Card>
              <CardContent className="pt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Catégorie</Label>
                  <Input value={course.category} onChange={(e) => updateCourse({ category: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Niveau</Label>
                  <Select value={course.level} onValueChange={(v) => updateCourse({ level: v as Course["level"] })}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Durée totale (heures)</Label>
                  <Input type="number" value={course.duration} onChange={(e) => updateCourse({ duration: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Prix (FCFA)</Label>
                  <Input type="number" value={course.price} onChange={(e) => updateCourse({ price: parseInt(e.target.value) || 0 })} className="h-8 text-sm" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center — Lesson editor */}
        <div className="flex-1 overflow-y-auto border rounded-xl bg-card p-5 min-w-0">
          {!selectedLesson && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <BookOpen className="size-10 opacity-30" />
              <p className="text-sm">Sélectionnez ou créez une leçon pour commencer</p>
              {course.modules.length === 0 && (
                <Button variant="outline" size="sm" onClick={addModule}>
                  <PlusCircle />
                  Créer un module
                </Button>
              )}
            </div>
          )}
          {selectedLesson && (
            <LessonEditor lesson={selectedLesson} onChange={updateLesson} />
          )}
        </div>

        {/* Right — Course info */}
        <div className="w-64 shrink-0 flex flex-col gap-3 overflow-y-auto">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">Informations du cours</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course-title" className="text-xs">Titre</Label>
                <Input
                  id="course-title"
                  value={course.title}
                  onChange={(e) => updateCourse({ title: e.target.value })}
                  className="h-8 text-sm"
                  placeholder="Titre du cours..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course-desc" className="text-xs">Description</Label>
                <Textarea
                  id="course-desc"
                  rows={4}
                  value={course.description}
                  onChange={(e) => updateCourse({ description: e.target.value })}
                  className="text-sm resize-none"
                  placeholder="Description du cours..."
                />
              </div>
              <Separator />
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-medium text-foreground">{course.modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leçons</span>
                  <span className="font-medium text-foreground">{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée totale</span>
                  <span className="font-medium text-foreground">{totalDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-medium text-foreground">{course.price.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={course.published ? "default" : "secondary"} className="text-xs h-4">
                    {course.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
