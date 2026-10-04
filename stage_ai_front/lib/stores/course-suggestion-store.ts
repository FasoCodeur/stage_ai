import { create } from "zustand"
import { type CourseSuggestion } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

export interface CreateCourseSuggestionPayload {
  titre: string
  description: string
  category: string
  level: string
  competences?: string[]
  justification: string
  objectifMetier?: string
  sourcePathId?: string
  demandeurId?: string
}

interface CourseSuggestionState {
  suggestions: CourseSuggestion[]
  isLoading: boolean

  fetchSuggestions: (statut?: string) => Promise<CourseSuggestion[]>
  createSuggestion: (payload: CreateCourseSuggestionPayload) => Promise<CourseSuggestion>
  fetchPendingCount: () => Promise<number>
  acceptSuggestion: (id: string, courseId?: string) => Promise<CourseSuggestion>
  rejectSuggestion: (id: string, motif?: string) => Promise<CourseSuggestion>
  deleteSuggestion: (id: string) => Promise<void>
}

export const useCourseSuggestionStore = create<CourseSuggestionState>()((set) => ({
  suggestions: [],
  isLoading: false,

  fetchSuggestions: async (statut) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<CourseSuggestion[]>(
        statut ? `/course-suggestions?statut=${statut}` : "/course-suggestions",
      )
      set({ suggestions: data, isLoading: false })
      return data
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createSuggestion: async (payload) => {
    const created = await apiFetch<CourseSuggestion>("/course-suggestions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    set((state) => {
      // Évite les doublons si la suggestion existait déjà (déduplication côté backend)
      const exists = state.suggestions.some((s) => s.id === created.id)
      return { suggestions: exists ? state.suggestions : [created, ...state.suggestions] }
    })
    return created
  },

  fetchPendingCount: async () => {
    const data = await apiFetch<{ count: number }>("/course-suggestions/pending/count")
    return data.count
  },

  acceptSuggestion: async (id, courseId) => {
    const updated = await apiFetch<CourseSuggestion>(`/course-suggestions/${id}/accept`, {
      method: "PUT",
      body: JSON.stringify({ courseId }),
    })
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === id ? updated : s)),
    }))
    return updated
  },

  rejectSuggestion: async (id, motif) => {
    const updated = await apiFetch<CourseSuggestion>(`/course-suggestions/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ motif }),
    })
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === id ? updated : s)),
    }))
    return updated
  },

  deleteSuggestion: async (id) => {
    await apiFetch<void>(`/course-suggestions/${id}`, { method: "DELETE" })
    set((state) => ({ suggestions: state.suggestions.filter((s) => s.id !== id) }))
  },
}))
