import { create } from "zustand"
import { ENROLLMENTS, type Enrollment } from "@/lib/mock-data"

interface EnrollmentState {
  enrollments: Enrollment[]
  selectedEnrollment: Enrollment | null
  isLoading: boolean

  setEnrollments: (enrollments: Enrollment[]) => void
  addEnrollment: (enrollment: Enrollment) => void
  updateEnrollment: (userId: string, courseId: string, data: Partial<Enrollment>) => void
  deleteEnrollment: (userId: string, courseId: string) => void
  completeLesson: (userId: string, courseId: string, lessonId: string) => void
  setSelectedEnrollment: (enrollment: Enrollment | null) => void
  setLoading: (loading: boolean) => void

  getEnrollmentsByUser: (userId: string) => Enrollment[]
  getEnrollmentsByCourse: (courseId: string) => Enrollment[]
  getEnrollment: (userId: string, courseId: string) => Enrollment | undefined
  getProgress: (userId: string, courseId: string) => number
}

export const useEnrollmentStore = create<EnrollmentState>()((set, get) => ({
  enrollments: ENROLLMENTS,
  selectedEnrollment: null,
  isLoading: false,

  setEnrollments: (enrollments) => set({ enrollments }),

  addEnrollment: (enrollment) =>
    set((state) => ({
      enrollments: [...state.enrollments, enrollment],
    })),

  updateEnrollment: (userId, courseId, data) =>
    set((state) => ({
      enrollments: state.enrollments.map((e) =>
        e.userId === userId && e.courseId === courseId ? { ...e, ...data } : e
      ),
    })),

  deleteEnrollment: (userId, courseId) =>
    set((state) => ({
      enrollments: state.enrollments.filter(
        (e) => !(e.userId === userId && e.courseId === courseId)
      ),
    })),

  completeLesson: (userId, courseId, lessonId) =>
    set((state) => ({
      enrollments: state.enrollments.map((e) => {
        if (e.userId !== userId || e.courseId !== courseId) return e
        if (e.completedLessons.includes(lessonId)) return e
        return {
          ...e,
          completedLessons: [...e.completedLessons, lessonId],
        }
      }),
    })),

  setSelectedEnrollment: (selectedEnrollment) => set({ selectedEnrollment }),
  setLoading: (isLoading) => set({ isLoading }),

  getEnrollmentsByUser: (userId) => get().enrollments.filter((e) => e.userId === userId),

  getEnrollmentsByCourse: (courseId) => get().enrollments.filter((e) => e.courseId === courseId),

  getEnrollment: (userId, courseId) =>
    get().enrollments.find((e) => e.userId === userId && e.courseId === courseId),

  getProgress: (userId, courseId) => {
    const enrollment = get().getEnrollment(userId, courseId)
    return enrollment?.progress ?? 0
  },
}))
