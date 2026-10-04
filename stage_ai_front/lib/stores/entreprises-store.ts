import { create } from "zustand"
import { type Entreprise } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

export interface TuteurEntreprise {
  id: string
  entrepriseId: string
  tuteurId: string
  createdAt: string
}

export interface TuteursResponse {
  entrepriseId: string
  tuteurs: TuteurEntreprise[]
  count: number
  max: number
  limiteAtteinte: boolean
}

/** Compte d'accès (rôle tuteur) ouvert en même temps qu'une entreprise partenaire. */
export interface CompteAccesEntreprise {
  cree: boolean
  email: string
  /** Mot de passe provisoire — renvoyé uniquement au moment de la création */
  motDePasse: string | null
  dejaExistant: boolean
  message: string
}

export interface CreateEntrepriseResponse {
  entreprise: Entreprise
  compte: CompteAccesEntreprise
}

interface EntreprisesState {
  entreprises: Entreprise[]
  isLoading: boolean

  setEntreprises: (entreprises: Entreprise[]) => void
  setLoading: (loading: boolean) => void

  fetchEntreprises: () => Promise<void>
  createEntreprise: (data: Partial<Entreprise>) => Promise<CreateEntrepriseResponse>
  updateEntreprise: (id: string, data: Partial<Entreprise>) => Promise<Entreprise>
  deleteEntreprise: (id: string) => Promise<void>
  getTuteurs: (entrepriseId: string) => Promise<TuteursResponse>
  /** Entreprise rattachée à un tuteur (null s'il n'est rattaché à aucune entreprise). */
  getEntrepriseOfTuteur: (tuteurId: string) => Promise<Entreprise | null>
  addTuteur: (entrepriseId: string, tuteurId: string) => Promise<TuteurEntreprise>
  removeTuteur: (entrepriseId: string, tuteurId: string) => Promise<void>

  getEntrepriseById: (id: string) => Entreprise | undefined
}

export const useEntreprisesStore = create<EntreprisesState>()((set, get) => ({
  entreprises: [],
  isLoading: false,

  setEntreprises: (entreprises) => set({ entreprises }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchEntreprises: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Entreprise[]>("/entreprises")
      set({ entreprises: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createEntreprise: async (data) => {
    const result = await apiFetch<CreateEntrepriseResponse>("/entreprises", {
      method: "POST",
      body: JSON.stringify(data),
    })
    set((state) => ({ entreprises: [result.entreprise, ...state.entreprises] }))
    return result
  },

  updateEntreprise: async (id, data) => {
    const entreprise = await apiFetch<Entreprise>(`/entreprises/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    set((state) => ({
      entreprises: state.entreprises.map((e) => (e.id === id ? entreprise : e)),
    }))
    return entreprise
  },

  deleteEntreprise: async (id) => {
    await apiFetch<void>(`/entreprises/${id}`, { method: "DELETE" })
    set((state) => ({ entreprises: state.entreprises.filter((e) => e.id !== id) }))
  },

  getTuteurs: async (entrepriseId) => {
    return apiFetch<TuteursResponse>(`/entreprises/${entrepriseId}/tuteurs`)
  },

  getEntrepriseOfTuteur: async (tuteurId) => {
    return apiFetch<Entreprise | null>(`/entreprises/by-tuteur/${tuteurId}`)
  },

  addTuteur: async (entrepriseId, tuteurId) => {
    return apiFetch<TuteurEntreprise>(`/entreprises/${entrepriseId}/tuteurs`, {
      method: "POST",
      body: JSON.stringify({ tuteurId }),
    })
  },

  removeTuteur: async (entrepriseId, tuteurId) => {
    await apiFetch<void>(`/entreprises/${entrepriseId}/tuteurs/${tuteurId}`, {
      method: "DELETE",
    })
  },

  getEntrepriseById: (id) => get().entreprises.find((e) => e.id === id),
}))