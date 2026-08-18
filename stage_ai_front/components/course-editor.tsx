"use client"

import { useState, useRef, useEffect } from "react"
import { Course, Module, Lesson, ContentBlock, QuizQuestion, ContentBlockType, SandboxLanguage } from "@/lib/mock-data"
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
  ArrowUp,
  ArrowDown,
  Check,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Code,
} from "lucide-react"

const BLOCK_TYPE_CONFIG: Record<ContentBlockType, { label: string; icon: React.ElementType; color: string }> = {
  texte: { label: "Texte", icon: FileText, color: "text-primary" },
  video: { label: "Vidéo", icon: Video, color: "text-chart-2" },
  quiz: { label: "Quiz", icon: CheckSquare, color: "text-chart-3" },
  sandbox: { label: "Sandbox", icon: Code2, color: "text-warning" },
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// Convertit une question de quiz de l'ancien format (correctIndex) vers le nouveau (correctIndexes)
function normalizeQuizQuestion(q: any): QuizQuestion {
  if (q.correctIndexes && Array.isArray(q.correctIndexes)) {
    return q as QuizQuestion
  }
  // Ancien format : correctIndex (nombre unique)
  return {
    id: q.id,
    question: q.question,
    options: q.options || [],
    correctIndexes: q.correctIndex !== undefined ? [q.correctIndex] : [0],
  }
}

// Convertit une leçon de l'ancien format (type unique) vers le nouveau format (blocks)
function normalizeLesson(lesson: any): Lesson {
  if (lesson.blocks && Array.isArray(lesson.blocks)) {
    // Normaliser aussi les quiz dans les blocs existants
    return {
      ...lesson,
      blocks: lesson.blocks.map((b: any) => ({
        ...b,
        quiz: b.quiz ? b.quiz.map(normalizeQuizQuestion) : b.quiz,
      })),
    } as Lesson
  }
  // Ancien format : type unique
  const block: ContentBlock = {
    id: generateId(),
    type: lesson.type || "texte",
    content: lesson.content || "",
    videoUrl: lesson.videoUrl,
    quiz: lesson.quiz ? lesson.quiz.map(normalizeQuizQuestion) : lesson.quiz,
    sandboxCode: lesson.sandboxCode,
    language: lesson.language,
  }
  return {
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration || 15,
    blocks: [block],
  }
}

// Normalise un cours complet
function normalizeCourse(course: Course): Course {
  return {
    ...course,
    modules: (course.modules || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).map(normalizeLesson),
    })),
  }
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Mettre à jour le contenu quand la valeur change de l'extérieur
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const toolbarButton = "inline-flex items-center justify-center size-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"

  return (
    <div className="flex flex-col gap-1.5 border rounded-lg overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/50 border-b flex-wrap">
        <button type="button" className={toolbarButton} onClick={() => execCommand("bold")} title="Gras">
          <Bold className="size-3.5" />
        </button>
        <button type="button" className={toolbarButton} onClick={() => execCommand("italic")} title="Italique">
          <Italic className="size-3.5" />
        </button>
        <button type="button" className={toolbarButton} onClick={() => execCommand("underline")} title="Souligné">
          <Underline className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" className={toolbarButton} onClick={() => execCommand("formatBlock", "h1")} title="Titre 1">
          <Heading1 className="size-3.5" />
        </button>
        <button type="button" className={toolbarButton} onClick={() => execCommand("formatBlock", "h2")} title="Titre 2">
          <Heading2 className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" className={toolbarButton} onClick={() => execCommand("insertUnorderedList")} title="Liste à puces">
          <List className="size-3.5" />
        </button>
        <button type="button" className={toolbarButton} onClick={() => execCommand("insertOrderedList")} title="Liste numérotée">
          <ListOrdered className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          className={toolbarButton}
          onClick={() => {
            const url = prompt("URL du lien :")
            if (url) execCommand("createLink", url)
          }}
          title="Insérer un lien"
        >
          <Link2 className="size-3.5" />
        </button>
        <button type="button" className={toolbarButton} onClick={() => execCommand("formatBlock", "pre")} title="Code">
          <Code className="size-3.5" />
        </button>
      </div>

      {/* Editable content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="min-h-32 px-3 py-2.5 text-sm text-foreground outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  )
}

// ─── Quiz Editor ───────────────────────────────────────────────────────────────
function QuizEditor({ quiz, onChange }: { quiz: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const addQuestion = () => {
    onChange([...quiz, { id: generateId(), question: "", options: ["", "", "", ""], correctIndexes: [0] }])
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
  const toggleCorrect = (qIdx: number, oIdx: number) => {
    const updated = quiz.map((q, i) => {
      if (i !== qIdx) return q
      const correctIndexes = q.correctIndexes.includes(oIdx)
        ? q.correctIndexes.filter((idx) => idx !== oIdx)
        : [...q.correctIndexes, oIdx]
      return { ...q, correctIndexes }
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
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correctIndexes.includes(oIdx)
                  return (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrect(qIdx, oIdx)}
                        className={cn(
                          "size-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                          isCorrect ? "border-primary bg-primary" : "border-muted-foreground/30"
                        )}
                        aria-label={`Marquer option ${oIdx + 1} comme correcte`}
                      >
                        {isCorrect && <Check className="size-3 text-white" />}
                      </button>
                      <Input
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Cochez une ou plusieurs bonnes réponses ({q.correctIndexes.length} sélectionnée{q.correctIndexes.length > 1 ? "s" : ""})
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Bouton d'ajout en bas */}
      {quiz.length > 0 && (
        <Button size="sm" variant="outline" onClick={addQuestion} className="self-start">
          <PlusCircle />
          Ajouter une question
        </Button>
      )}
    </div>
  )
}

// ─── Content Block Editor ──────────────────────────────────────────────────────
function ContentBlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: ContentBlock
  onChange: (b: ContentBlock) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const cfg = BLOCK_TYPE_CONFIG[block.type]
  const TypeIcon = cfg.icon

  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-3 flex flex-col gap-3">
        {/* Block header */}
        <div className="flex items-center gap-2">
          <TypeIcon className={cn("size-4", cfg.color)} />
          <span className="text-sm font-medium text-foreground flex-1">
            {cfg.label}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onMoveUp} disabled={isFirst} className="h-7 w-7 p-0">
              <ArrowUp className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onMoveDown} disabled={isLast} className="h-7 w-7 p-0">
              <ArrowDown className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive h-7 w-7 p-0">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Block type selector */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Type de contenu</Label>
          <Select
            value={block.type}
            onValueChange={(v) => onChange({ ...block, type: v as ContentBlockType })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(BLOCK_TYPE_CONFIG) as ContentBlockType[]).map((t) => {
                const c = BLOCK_TYPE_CONFIG[t]
                return (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <c.icon className={cn("size-4", c.color)} />
                      {c.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Block content by type */}
        {block.type === "texte" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Contenu</Label>
            <RichTextEditor
              value={block.content || ""}
              onChange={(html) => onChange({ ...block, content: html })}
              placeholder="Rédigez votre contenu ici..."
            />
          </div>
        )}

        {block.type === "video" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">URL de la vidéo (YouTube embed ou lien direct)</Label>
              <Input
                value={block.videoUrl || ""}
                onChange={(e) => onChange({ ...block, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            {block.videoUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
                <iframe
                  src={block.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Aperçu vidéo"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={3}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Description de la vidéo..."
              />
            </div>
          </div>
        )}

        {block.type === "quiz" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Introduction du quiz</Label>
              <Textarea
                rows={2}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Instructions pour les étudiants..."
              />
            </div>
            <Separator />
            <QuizEditor
              quiz={block.quiz || []}
              onChange={(q) => onChange({ ...block, quiz: q })}
            />
          </div>
        )}

        {block.type === "sandbox" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Instructions</Label>
              <Textarea
                rows={3}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Expliquez l'exercice aux étudiants..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Langage</Label>
              <Select
                value={block.language || "html"}
                onValueChange={(v) => onChange({ ...block, language: v as SandboxLanguage })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML / CSS / JS</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Code de départ</Label>
              <Textarea
                rows={10}
                value={block.sandboxCode || ""}
                onChange={(e) => onChange({ ...block, sandboxCode: e.target.value })}
                placeholder={block.language === "html" ? "<!-- Entrez le code HTML/CSS/JS -->" : "// Entrez votre code ici"}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Lesson Editor ─────────────────────────────────────────────────────────────
function LessonEditor({ lesson, onChange }: { lesson: Lesson; onChange: (l: Lesson) => void }) {
  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = { id: generateId(), type }
    onChange({ ...lesson, blocks: [...lesson.blocks, newBlock] })
  }

  const updateBlock = (blockId: string, updated: ContentBlock) => {
    onChange({
      ...lesson,
      blocks: lesson.blocks.map((b) => (b.id === blockId ? updated : b)),
    })
  }

  const deleteBlock = (blockId: string) => {
    onChange({ ...lesson, blocks: lesson.blocks.filter((b) => b.id !== blockId) })
  }

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    const idx = lesson.blocks.findIndex((b) => b.id === blockId)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= lesson.blocks.length) return
    const blocks = [...lesson.blocks]
    ;[blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]]
    onChange({ ...lesson, blocks })
  }

  return (
    <div className="flex flex-col gap-4">
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
        <Label htmlFor="lesson-duration">Durée estimée (minutes)</Label>
        <Input
          id="lesson-duration"
          type="number"
          min={1}
          value={lesson.duration}
          onChange={(e) => onChange({ ...lesson, duration: parseInt(e.target.value) || 0 })}
        />
      </div>

      <Separator />

      {/* Blocks */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Contenus ({lesson.blocks.length})
          </p>
          <div className="flex items-center gap-1.5">
            {(Object.keys(BLOCK_TYPE_CONFIG) as ContentBlockType[]).map((t) => {
              const cfg = BLOCK_TYPE_CONFIG[t]
              return (
                <Button key={t} size="sm" variant="outline" onClick={() => addBlock(t)} className="h-7 px-2 text-xs">
                  <cfg.icon className={cn("size-3.5", cfg.color)} />
                  {cfg.label}
                </Button>
              )
            })}
          </div>
        </div>

        {lesson.blocks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            Aucun contenu. Ajoutez une vidéo, du texte, un quiz ou un exercice sandbox.
          </div>
        )}

        {lesson.blocks.map((block, idx) => (
          <ContentBlockEditor
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(block.id, b)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            isFirst={idx === 0}
            isLast={idx === lesson.blocks.length - 1}
          />
        ))}

        {/* Boutons d'ajout en bas */}
        {lesson.blocks.length > 0 && (
          <div className="border-t pt-3 mt-1">
            <p className="text-xs text-muted-foreground mb-2">Ajouter un contenu :</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(BLOCK_TYPE_CONFIG) as ContentBlockType[]).map((t) => {
                const cfg = BLOCK_TYPE_CONFIG[t]
                return (
                  <Button key={t} size="sm" variant="outline" onClick={() => addBlock(t)} className="h-7 px-2 text-xs">
                    <cfg.icon className={cn("size-3.5", cfg.color)} />
                    {cfg.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
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
            const firstBlockType = lesson.blocks[0]?.type ?? "texte"
            const cfg = BLOCK_TYPE_CONFIG[firstBlockType]
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
  const [course, setCourse] = useState<Course>(() => normalizeCourse(initial))
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set((initial.modules || []).map((m) => m.id))
  )
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    () => initial.modules?.[0]?.lessons?.[0]?.id ?? null
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
      duration: 15,
      blocks: [{ id: generateId(), type: "texte", content: "" }],
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