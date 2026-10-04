import { create } from "zustand"
import { type LearningPathWithSteps, type LearningPathStep, type Enrollment } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

/** Étape générée par l'IA, prête à être envoyée au backend */
export interface GeneratedStep {
  ordre: number
  titre: string
  description: string
  objectif?: string
  semaineDebut: number
  dureeHeures: number
  courseId: string | null
  competences: string[]
  suggestedCourse: {
    category: string
    level: string
    justification: string
    competences: string[]
  } | null
}

export interface GeneratedPath {
  titre: string
  resume: string
  objectifMetier: string
  niveauEvalue: string
  modeleIA?: string
  steps: GeneratedStep[]
}

interface LearningPathState {
  paths: LearningPathWithSteps[]
  selected: LearningPathWithSteps | null
  isLoading: boolean

  fetchUserPaths: (userId: string) => Promise<LearningPathWithSteps[]>
  fetchPath: (id: string) => Promise<LearningPathWithSteps>
  savePath: (userId: string, generated: GeneratedPath) => Promise<LearningPathWithSteps>
  updateStep: (stepId: string, statut: LearningPathStep["statut"]) => Promise<LearningPathStep>
  enrollStep: (pathId: string, stepId: string, userId: string) => Promise<Enrollment>
  deletePath: (id: string) => Promise<void>
}

export const useLearningPathStore = create<LearningPathState>()((set) => ({
  paths: [],
  selected: null,
  isLoading: false,

  fetchUserPaths: async (userId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<LearningPathWithSteps[]>(`/learning-paths/user/${userId}`)
      set({ paths: data, isLoading: false })
      return data
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchPath: async (id) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<LearningPathWithSteps>(`/learning-paths/${id}`)
      set({ selected: data, isLoading: false })
      return data
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  savePath: async (userId, generated) => {
    const created = await apiFetch<LearningPathWithSteps>("/learning-paths", {
      method: "POST",
      body: JSON.stringify({
        userId,
        objectifMetier: generated.objectifMetier,
        niveauEvalue: generated.niveauEvalue,
        titre: generated.titre,
        resume: generated.resume,
        modeleIA: generated.modeleIA,
        steps: generated.steps,
      }),
    })
    set((state) => ({ paths: [created, ...state.paths], selected: created }))
    return created
  },

  updateStep: async (stepId, statut) => {
    const updated = await apiFetch<LearningPathStep>(`/learning-paths/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify({ statut }),
    })
    set((state) => ({
      paths: state.paths.map((p) => ({
        ...p,
        steps: p.steps.map((s) => (s.id === stepId ? updated : s)),
      })),
      selected: state.selected
        ? { ...state.selected, steps: state.selected.steps.map((s) => (s.id === stepId ? updated : s)) }
        : null,
    }))
    return updated
  },

  enrollStep: async (pathId, stepId, userId) => {
    const enrollment = await apiFetch<Enrollment>(
      `/learning-paths/${pathId}/steps/${stepId}/enroll`,
      { method: "POST", body: JSON.stringify({ userId }) },
    )
    set((state) => ({
      paths: state.paths.map((p) =>
        p.path.id === pathId
          ? { ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, statut: "en_cours" } : s)) }
          : p,
      ),
    }))
    return enrollment
  },

  deletePath: async (id) => {
    await apiFetch<void>(`/learning-paths/${id}`, { method: "DELETE" })
    set((state) => ({
      paths: state.paths.filter((p) => p.path.id !== id),
      selected: state.selected?.path.id === id ? null : state.selected,
    }))
  },
}))
