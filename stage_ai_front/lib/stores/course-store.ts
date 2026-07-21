import { create } from "zustand"
import { COURSES, type Course } from "@/lib/mock-data"

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
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  courses: COURSES,
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
}))
