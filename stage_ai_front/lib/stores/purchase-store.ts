import { create } from "zustand"
import { type Purchase } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface PurchaseState {
  purchases: Purchase[]
  selectedPurchase: Purchase | null
  isLoading: boolean

  setPurchases: (purchases: Purchase[]) => void
  addPurchase: (purchase: Purchase) => void
  setSelectedPurchase: (purchase: Purchase | null) => void
  setLoading: (loading: boolean) => void

  // Actions API
  fetchPurchases: () => Promise<void>
  fetchPurchasesByUser: (userId: string) => Promise<void>
  fetchAllPurchases: () => Promise<void>
  createPurchase: (userId: string, courseId: string, method?: string) => Promise<Purchase>
  hasPurchasedApi: (userId: string, courseId: string) => Promise<boolean>

  getPurchasesByUser: (userId: string) => Purchase[]
  getPurchasesByCourse: (courseId: string) => Purchase[]
  hasPurchased: (userId: string, courseId: string) => boolean
}

export const usePurchaseStore = create<PurchaseState>()((set, get) => ({
  purchases: [],
  selectedPurchase: null,
  isLoading: false,

  setPurchases: (purchases) => set({ purchases }),

  addPurchase: (purchase) =>
    set((state) => ({
      purchases: [...state.purchases, purchase],
    })),

  setSelectedPurchase: (selectedPurchase) => set({ selectedPurchase }),
  setLoading: (isLoading) => set({ isLoading }),

  // ── Actions API ──
  fetchPurchases: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Purchase[]>("/purchases")
      set({ purchases: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchPurchasesByUser: async (userId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Purchase[]>(`/purchases/user/${userId}`)
      set({ purchases: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchAllPurchases: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Purchase[]>("/purchases")
      set({ purchases: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createPurchase: async (userId, courseId, method = "orange_money") => {
    const data = await apiFetch<Purchase>("/purchases", {
      method: "POST",
      body: JSON.stringify({ userId, courseId, method }),
    })
    set((state) => ({
      purchases: [...state.purchases, data],
    }))
    return data
  },

  hasPurchasedApi: async (userId, courseId) => {
    const data = await apiFetch<{ purchased: boolean }>(`/purchases/check/${userId}/${courseId}`)
    return data.purchased
  },

  getPurchasesByUser: (userId) => get().purchases.filter((p) => p.userId === userId),

  getPurchasesByCourse: (courseId) => get().purchases.filter((p) => p.courseId === courseId),

  hasPurchased: (userId, courseId) =>
    get().purchases.some((p) => p.userId === userId && p.courseId === courseId),
}))