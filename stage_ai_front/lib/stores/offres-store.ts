import { create } from "zustand"
import { type Offre } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface OffresState {
  offres: Offre[]
  selectedOffre: Offre | null
  isLoading: boolean

  setOffres: (offres: Offre[]) => void
  setSelectedOffre: (offre: Offre | null) => void
  setLoading: (loading: boolean) => void

  // Actions API
  fetchOffres: (statut?: string) => Promise<void>
  fetchOffre: (id: string) => Promise<Offre>
  createOffre: (data: Partial<Offre>) => Promise<Offre>
  updateOffre: (id: string, data: Partial<Offre>) => Promise<Offre>
  validateOffre: (id: string) => Promise<Offre>
  refuseOffre: (id: string) => Promise<Offre>
  deleteOffreApi: (id: string) => Promise<void>
  postuler: (offreId: string, etudiantId: string) => Promise<unknown>

  getOffreById: (id: string) => Offre | undefined
  getOffresValidees: () => Offre[]
}

export const useOffresStore = create<OffresState>()((set, get) => ({
  offres: [],
  selectedOffre: null,
  isLoading: false,

  setOffres: (offres) => set({ offres }),
  setSelectedOffre: (selectedOffre) => set({ selectedOffre }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchOffres: async (statut) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Offre[]>(statut ? `/offres?statut=${statut}` : "/offres")
      set({ offres: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchOffre: async (id) => {
    return apiFetch<Offre>(`/offres/${id}`)
  },

  createOffre: async (data) => {
    const offre = await apiFetch<Offre>("/offres", {
      method: "POST",
      body: JSON.stringify(data),
    })
    set((state) => ({ offres: [...state.offres, offre] }))
    return offre
  },

  updateOffre: async (id, data) => {
    const offre = await apiFetch<Offre>(`/offres/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    set((state) => ({
      offres: state.offres.map((o) => (o.id === id ? offre : o)),
    }))
    return offre
  },

  validateOffre: async (id) => {
    const offre = await apiFetch<Offre>(`/offres/${id}/validate`, { method: "PUT" })
    set((state) => ({ offres: state.offres.map((o) => (o.id === id ? offre : o)) }))
    return offre
  },

  refuseOffre: async (id) => {
    const offre = await apiFetch<Offre>(`/offres/${id}/refuse`, { method: "PUT" })
    set((state) => ({ offres: state.offres.map((o) => (o.id === id ? offre : o)) }))
    return offre
  },

  deleteOffreApi: async (id) => {
    await apiFetch<void>(`/offres/${id}`, { method: "DELETE" })
    set((state) => ({ offres: state.offres.filter((o) => o.id !== id) }))
  },

  postuler: async (offreId, etudiantId) => {
    return apiFetch(`/offres/${offreId}/postuler`, {
      method: "POST",
      body: JSON.stringify({ etudiantId }),
    })
  },

  getOffreById: (id) => get().offres.find((o) => o.id === id),
  getOffresValidees: () => get().offres.filter((o) => o.statut === "validee"),
}))