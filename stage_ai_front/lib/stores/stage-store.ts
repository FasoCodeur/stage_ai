import { create } from "zustand"
import { type Stage, type Message, type Tache } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface StageState {
  stages: Stage[]
  currentStage: Stage | null
  messages: Message[]
  isLoading: boolean

  setStages: (stages: Stage[]) => void
  setCurrentStage: (stage: Stage | null) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void

  fetchStages: (query?: string) => Promise<void>
  fetchStage: (id: string) => Promise<Stage>
  updateStage: (id: string, data: Partial<Stage>) => Promise<Stage>
  fetchMessages: (stageId: string) => Promise<void>
  envoyerMessage: (stageId: string, expediteurId: string, contenu: string) => Promise<Message>
  updateTacheStatut: (missionId: string, tacheId: string, statut: Tache["statut"]) => void

  getStageById: (id: string) => Stage | undefined
}

export const useStageStore = create<StageState>()((set, get) => ({
  stages: [],
  currentStage: null,
  messages: [],
  isLoading: false,

  setStages: (stages) => set({ stages }),
  setCurrentStage: (currentStage) => set({ currentStage }),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchStages: async (query) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Stage[]>(`/stages${query ? `?${query}` : ""}`)
      set({ stages: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchStage: async (id) => {
    set({ isLoading: true })
    try {
      const stage = await apiFetch<Stage>(`/stages/${id}`)
      set({ currentStage: stage, isLoading: false })
      return stage
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  updateStage: async (id, data) => {
    const stage = await apiFetch<Stage>(`/stages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    set({ currentStage: stage })
    return stage
  },

  fetchMessages: async (stageId) => {
    const messages = await apiFetch<Message[]>(`/stages/${stageId}/messages`)
    set({ messages })
  },

  envoyerMessage: async (stageId, expediteurId, contenu) => {
    const msg = await apiFetch<Message>(`/stages/${stageId}/messages`, {
      method: "POST",
      body: JSON.stringify({ expediteurId, contenu }),
    })
    set((state) => ({ messages: [...state.messages, msg] }))
    return msg
  },

  updateTacheStatut: (missionId, tacheId, statut) => {
    const stage = get().currentStage
    if (!stage) return
    const taches = (stage.taches ?? []).map((t) =>
      t.id === tacheId ? { ...t, statut } : t
    )
    set({ currentStage: { ...stage, taches } })
  },

  getStageById: (id) => get().stages.find((s) => s.id === id),
}))