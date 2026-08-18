import { create } from "zustand"
import { type StageRequest } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

type StageStatus = "en_attente" | "validé" | "refusé"

interface StageRequestState {
  stageRequests: StageRequest[]
  filters: {
    status?: StageStatus
    domain?: string
    search?: string
  }
  selectedStageRequest: StageRequest | null
  isLoading: boolean

  setStageRequests: (requests: StageRequest[]) => void
  addStageRequest: (request: StageRequest) => void
  updateStageRequest: (id: string, data: Partial<StageRequest>) => void
  deleteStageRequest: (id: string) => void
  validateStageRequest: (id: string, status: "validé" | "refusé", studentId?: string) => void
  setFilters: (filters: Partial<StageRequestState["filters"]>) => void
  setSelectedStageRequest: (request: StageRequest | null) => void
  setLoading: (loading: boolean) => void

  // Actions API
  fetchStageRequests: () => Promise<void>
  createStageRequest: (data: Partial<StageRequest>) => Promise<StageRequest>
  updateStageRequestStatusApi: (id: string, status: StageStatus) => Promise<StageRequest>
  deleteStageRequestApi: (id: string) => Promise<void>

  getFilteredRequests: () => StageRequest[]
  getRequestById: (id: string) => StageRequest | undefined
  getRequestsByStudent: (studentId: string) => StageRequest[]
  getPendingRequests: () => StageRequest[]
}

export const useStageRequestStore = create<StageRequestState>()((set, get) => ({
  stageRequests: [],
  filters: {},
  selectedStageRequest: null,
  isLoading: false,

  setStageRequests: (stageRequests) => set({ stageRequests }),

  addStageRequest: (request) =>
    set((state) => ({
      stageRequests: [...state.stageRequests, request],
    })),

  updateStageRequest: (id, data) =>
    set((state) => ({
      stageRequests: state.stageRequests.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  deleteStageRequest: (id) =>
    set((state) => ({
      stageRequests: state.stageRequests.filter((r) => r.id !== id),
    })),

  validateStageRequest: (id, status, studentId) =>
    set((state) => ({
      stageRequests: state.stageRequests.map((r) =>
        r.id === id ? { ...r, status, studentId: studentId ?? r.studentId } : r
      ),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedStageRequest: (selectedStageRequest) => set({ selectedStageRequest }),
  setLoading: (isLoading) => set({ isLoading }),

  // ── Actions API ──
  fetchStageRequests: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<StageRequest[]>("/stage-requests")
      set({ stageRequests: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createStageRequest: async (data) => {
    const request = await apiFetch<StageRequest>("/stage-requests", {
      method: "POST",
      body: JSON.stringify(data),
    })
    set((state) => ({ stageRequests: [...state.stageRequests, request] }))
    return request
  },

  updateStageRequestStatusApi: async (id, status) => {
    const request = await apiFetch<StageRequest>(`/stage-requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
    set((state) => ({
      stageRequests: state.stageRequests.map((r) => (r.id === id ? request : r)),
    }))
    return request
  },

  deleteStageRequestApi: async (id) => {
    await apiFetch<void>(`/stage-requests/${id}`, {
      method: "DELETE",
    })
    set((state) => ({
      stageRequests: state.stageRequests.filter((r) => r.id !== id),
    }))
  },

  getFilteredRequests: () => {
    const { stageRequests, filters } = get()
    return stageRequests.filter((request) => {
      const matchesStatus = filters.status ? request.status === filters.status : true
      const matchesDomain = filters.domain ? request.domain === filters.domain : true
      const matchesSearch = filters.search
        ? request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          request.companyName.toLowerCase().includes(filters.search.toLowerCase())
        : true
      return matchesStatus && matchesDomain && matchesSearch
    })
  },

  getRequestById: (id) => get().stageRequests.find((r) => r.id === id),

  getRequestsByStudent: (studentId) =>
    get().stageRequests.filter((r) => r.studentId === studentId),

  getPendingRequests: () => get().stageRequests.filter((r) => r.status === "en_attente"),
}))