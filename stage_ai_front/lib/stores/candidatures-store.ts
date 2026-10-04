import { create } from "zustand"
import { type Candidature } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface CandidaturesState {
  candidatures: Candidature[]
  isLoading: boolean

  setCandidatures: (candidatures: Candidature[]) => void
  setLoading: (loading: boolean) => void

  fetchCandidatures: (offreId?: string) => Promise<void>
  fetchByEtudiant: (etudiantId: string) => Promise<void>
  creerCandidature: (offreId: string, etudiantId: string) => Promise<Candidature>
  validerCandidature: (id: string, mentorId?: string) => Promise<Candidature>
  refuserCandidature: (id: string) => Promise<Candidature>

  getCandidatureById: (id: string) => Candidature | undefined
  getPendingCandidatures: () => Candidature[]
}

export const useCandidaturesStore = create<CandidaturesState>()((set, get) => ({
  candidatures: [],
  isLoading: false,

  setCandidatures: (candidatures) => set({ candidatures }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchCandidatures: async (offreId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Candidature[]>(offreId ? `/candidatures?offreId=${offreId}` : "/candidatures")
      set({ candidatures: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchByEtudiant: async (etudiantId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Candidature[]>(`/candidatures/etudiant/${etudiantId}`)
      set({ candidatures: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  creerCandidature: async (offreId, etudiantId) => {
    const cand = await apiFetch<Candidature>("/candidatures", {
      method: "POST",
      body: JSON.stringify({ offreId, etudiantId }),
    })
    set((state) => ({ candidatures: [...state.candidatures, cand] }))
    return cand
  },

  validerCandidature: async (id, mentorId) => {
    const cand = await apiFetch<Candidature>(`/candidatures/${id}/validate`, {
      method: "PUT",
      body: JSON.stringify({ mentorId }),
    })
    set((state) => ({ candidatures: state.candidatures.map((c) => (c.id === id ? cand : c)) }))
    return cand
  },

  refuserCandidature: async (id) => {
    const cand = await apiFetch<Candidature>(`/candidatures/${id}/refuse`, { method: "PUT" })
    set((state) => ({ candidatures: state.candidatures.map((c) => (c.id === id ? cand : c)) }))
    return cand
  },

  getCandidatureById: (id) => get().candidatures.find((c) => c.id === id),
  getPendingCandidatures: () => get().candidatures.filter((c) => c.statut === "en_attente"),
}))