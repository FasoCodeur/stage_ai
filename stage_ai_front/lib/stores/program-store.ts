import { create } from "zustand"
import { PROGRAMS, PROGRAM_ENROLLMENTS, LEVELS, type Program, type ProgramEnrollment, type Level } from "@/lib/mock-data"

interface ProgramFilters {
  published?: boolean
}

interface ProgramState {
  programs: Program[]
  enrollments: ProgramEnrollment[]
  levels: Level[]
  filters: ProgramFilters
  selectedProgram: Program | null
  isLoading: boolean

  setPrograms: (programs: Program[]) => void
  addProgram: (program: Program) => void
  updateProgram: (id: string, data: Partial<Program>) => void
  deleteProgram: (id: string) => void
  publishProgram: (id: string, published: boolean) => void
  setFilters: (filters: Partial<ProgramFilters>) => void
  setSelectedProgram: (program: Program | null) => void
  setLoading: (loading: boolean) => void

  getFilteredPrograms: () => Program[]
  getProgramById: (id: string) => Program | undefined
  getPublishedPrograms: () => Program[]
  getProgramsByMentor: (mentorId: string) => Program[]
  getProgramsByStudent: (studentId: string) => Program[]
  getEnrollmentsByProgram: (programId: string) => ProgramEnrollment[]
  getEnrollmentsByUser: (userId: string) => ProgramEnrollment[]
  getLevelsByProgram: (programId: string) => Level[]
  enrollStudent: (programId: string, userId: string) => void
  completeCourse: (programId: string, userId: string, courseId: string) => void

  // Level CRUD
  addLevel: (level: Level) => void
  updateLevel: (id: string, data: Partial<Level>) => void
  removeLevel: (id: string) => void
  assignCourseToLevel: (levelId: string, courseId: string) => void
  removeCourseFromLevel: (levelId: string, courseId: string) => void
}

export const useProgramStore = create<ProgramState>()((set, get) => ({
  programs: PROGRAMS,
  enrollments: PROGRAM_ENROLLMENTS,
  levels: LEVELS,
  filters: {},
  selectedProgram: null,
  isLoading: false,

  setPrograms: (programs) => set({ programs }),

  addProgram: (program) =>
    set((state) => ({
      programs: [...state.programs, program],
    })),

  updateProgram: (id, data) =>
    set((state) => ({
      programs: state.programs.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  deleteProgram: (id) =>
    set((state) => ({
      programs: state.programs.filter((p) => p.id !== id),
      levels: state.levels.filter((l) => l.programId !== id),
    })),

  publishProgram: (id, published) =>
    set((state) => ({
      programs: state.programs.map((p) => (p.id === id ? { ...p, published } : p)),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedProgram: (selectedProgram) => set({ selectedProgram }),
  setLoading: (isLoading) => set({ isLoading }),

  getFilteredPrograms: () => {
    const { programs, filters } = get()
    return programs.filter((program) => {
      const matchesPublished = filters.published !== undefined ? program.published === filters.published : true
      return matchesPublished
    })
  },

  getProgramById: (id) => get().programs.find((p) => p.id === id),

  getPublishedPrograms: () => get().programs.filter((p) => p.published),

  getProgramsByMentor: (mentorId) => get().programs.filter((p) => p.mentorId === mentorId),

  getProgramsByStudent: (studentId) => get().programs.filter((p) => p.students?.includes(studentId)),

  getEnrollmentsByProgram: (programId) => get().enrollments.filter((e) => e.programId === programId),

  getEnrollmentsByUser: (userId) => get().enrollments.filter((e) => e.userId === userId),

  getLevelsByProgram: (programId) => get().levels.filter((l) => l.programId === programId).sort((a, b) => a.order - b.order),

  enrollStudent: (programId, userId) => {
    const program = get().programs.find((p) => p.id === programId)
    if (!program) return

    if (!program.students?.includes(userId)) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, students: [...(p.students || []), userId] } : p
        ),
      }))
    }

    const existing = get().enrollments.find((e) => e.userId === userId && e.programId === programId)
    if (!existing) {
      set((state) => ({
        enrollments: [
          ...state.enrollments,
          {
            userId,
            programId,
            progress: 0,
            currentLevelIndex: 0,
            completedLevels: [],
            completedCourses: [],
            status: "active",
            enrolledAt: new Date().toISOString().split("T")[0],
          },
        ],
      }))
    }
  },

  completeCourse: (programId, userId, courseId) => {
    const { programs, enrollments, levels } = get()
    const program = programs.find((p) => p.id === programId)
    if (!program) return

    const enrollment = enrollments.find((e) => e.userId === userId && e.programId === programId)
    if (!enrollment || enrollment.status !== "active") return

    const updatedCompletedCourses = enrollment.completedCourses.includes(courseId)
      ? enrollment.completedCourses
      : [...enrollment.completedCourses, courseId]

    const programLevels = levels.filter((l) => l.programId === programId).sort((a, b) => a.order - b.order)
    const currentLevel = programLevels[enrollment.currentLevelIndex]
    let updatedCompletedLevels = [...enrollment.completedLevels]
    let updatedCurrentLevelIndex = enrollment.currentLevelIndex
    let updatedStatus: "active" | "completed" | "expired" = enrollment.status

    if (currentLevel) {
      const allCoursesCompleted = currentLevel.courses.every((cid) => updatedCompletedCourses.includes(cid))
      if (allCoursesCompleted && !updatedCompletedLevels.includes(currentLevel.id)) {
        updatedCompletedLevels = [...updatedCompletedLevels, currentLevel.id]
        if (updatedCurrentLevelIndex < programLevels.length - 1) {
          updatedCurrentLevelIndex += 1
        } else {
          updatedStatus = "completed"
        }
      }
    }

    const totalLevels = programLevels.length
    const progress = totalLevels > 0 ? Math.round((updatedCompletedLevels.length / totalLevels) * 100) : 0

    set((state) => ({
      enrollments: state.enrollments.map((e) => {
        if (e.userId !== userId || e.programId !== programId) return e
        return {
          ...e,
          progress,
          currentLevelIndex: updatedCurrentLevelIndex,
          completedLevels: updatedCompletedLevels,
          completedCourses: updatedCompletedCourses,
          status: updatedStatus,
        }
      }),
    }))
  },

  // Level CRUD
  addLevel: (level) =>
    set((state) => ({
      levels: [...state.levels, level],
    })),

  updateLevel: (id, data) =>
    set((state) => ({
      levels: state.levels.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),

  removeLevel: (id) =>
    set((state) => ({
      levels: state.levels.filter((l) => l.id !== id),
    })),

  assignCourseToLevel: (levelId, courseId) =>
    set((state) => ({
      levels: state.levels.map((l) => {
        if (l.id !== levelId) return l
        if (l.courses.includes(courseId)) return l
        return { ...l, courses: [...l.courses, courseId] }
      }),
    })),

  removeCourseFromLevel: (levelId, courseId) =>
    set((state) => ({
      levels: state.levels.map((l) => {
        if (l.id !== levelId) return l
        return { ...l, courses: l.courses.filter((c) => c !== courseId) }
      }),
    })),
}))