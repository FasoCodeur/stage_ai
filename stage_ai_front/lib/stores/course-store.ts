import { create } from "zustand"
import { type Course } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface CourseFilters {
  category?: string
  level?: string
  search?: string
  published?: boolean
}

interface CourseState {
  courses: Course[]
  filters: CourseFilters
  selectedCourse: Course | null
  isLoading: boolean

  setCourses: (courses: Course[]) => void
  addCourse: (course: Course) => void
  updateCourse: (id: string, data: Partial<Course>) => void
  deleteCourse: (id: string) => void
  publishCourse: (id: string, published: boolean) => void
  setFilters: (filters: Partial<CourseFilters>) => void
  setSelectedCourse: (course: Course | null) => void
  setLoading: (loading: boolean) => void

  getFilteredCourses: () => Course[]
  getCourseById: (id: string) => Course | undefined
  getPublishedCourses: () => Course[]
  getCoursesByProfessor: (professorId: string) => Course[]

  // Actions API
  sanitizeCourse: (course: Partial<Course>) => Partial<Course>
  fetchCourses: () => Promise<void>
  fetchCourseById: (id: string) => Promise<Course>
  fetchCoursesByProfessor: (professorId: string) => Promise<void>
  fetchCoursesByStudent: (studentId: string) => Promise<void>
  createCourse: (course: Partial<Course>) => Promise<Course>
  updateCourseApi: (id: string, course: Partial<Course>) => Promise<Course>
  deleteCourseApi: (id: string) => Promise<void>
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  courses: [],
  filters: {},
  selectedCourse: null,
  isLoading: false,

  setCourses: (courses) => set({ courses }),

  addCourse: (course) =>
    set((state) => ({
      courses: [...state.courses, course],
    })),

  updateCourse: (id, data) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  deleteCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    })),

  publishCourse: (id, published) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, published } : c)),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedCourse: (selectedCourse) => set({ selectedCourse }),
  setLoading: (isLoading) => set({ isLoading }),

  getFilteredCourses: () => {
    const { courses, filters } = get()
    return courses.filter((course) => {
      const matchesCategory = filters.category ? course.category === filters.category : true
      const matchesLevel = filters.level ? course.level === filters.level : true
      const matchesPublished = filters.published !== undefined ? course.published === filters.published : true
      const matchesSearch = filters.search
        ? course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          course.description.toLowerCase().includes(filters.search.toLowerCase())
        : true
      return matchesCategory && matchesLevel && matchesPublished && matchesSearch
    })
  },

  getCourseById: (id) => get().courses.find((c) => c.id === id),

  getPublishedCourses: () => get().courses.filter((c) => c.published),

  getCoursesByProfessor: (professorId) => get().courses.filter((c) => c.professorId === professorId),

  // ── Actions API ──
  // Extrait uniquement les champs acceptés par le backend DTO
  sanitizeCourse: (course: Partial<Course>) => {
    const { id, students, createdAt, ...sanitized } = course as any
    return sanitized
  },

  fetchCourses: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Course[]>("/courses")
      set({ courses: data })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCourseById: async (id) => {
    const data = await apiFetch<Course>(`/courses/${id}`)
    set({ selectedCourse: data })
    return data
  },

  fetchCoursesByProfessor: async (professorId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Course[]>(`/courses?professorId=${professorId}`)
      set({ courses: data })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCoursesByStudent: async (studentId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Course[]>(`/courses/student/${studentId}`)
      set({ courses: data })
    } finally {
      set({ isLoading: false })
    }
  },

  createCourse: async (course) => {
    const data = await apiFetch<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(get().sanitizeCourse(course)),
    })
    set((state) => ({ courses: [...state.courses, data] }))
    return data
  },

  updateCourseApi: async (id, course) => {
    const data = await apiFetch<Course>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(get().sanitizeCourse(course)),
    })
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? data : c)),
    }))
    return data
  },

  deleteCourseApi: async (id) => {
    await apiFetch<void>(`/courses/${id}`, {
      method: "DELETE",
    })
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    }))
  },
}))