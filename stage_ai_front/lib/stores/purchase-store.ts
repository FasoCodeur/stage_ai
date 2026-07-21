import { create } from "zustand"
import { PURCHASES, type Purchase } from "@/lib/mock-data"

interface PurchaseState {
  purchases: Purchase[]
  selectedPurchase: Purchase | null
  isLoading: boolean

  setPurchases: (purchases: Purchase[]) => void
  addPurchase: (purchase: Purchase) => void
  setSelectedPurchase: (purchase: Purchase | null) => void
  setLoading: (loading: boolean) => void

  getPurchasesByUser: (userId: string) => Purchase[]
  getPurchasesByCourse: (courseId: string) => Purchase[]
  hasPurchased: (userId: string, courseId: string) => boolean
}

export const usePurchaseStore = create<PurchaseState>()((set, get) => ({
  purchases: PURCHASES,
  selectedPurchase: null,
  isLoading: false,

  setPurchases: (purchases) => set({ purchases }),

  addPurchase: (purchase) =>
    set((state) => ({
      purchases: [...state.purchases, purchase],
    })),

  setSelectedPurchase: (selectedPurchase) => set({ selectedPurchase }),
  setLoading: (isLoading) => set({ isLoading }),

  getPurchasesByUser: (userId) => get().purchases.filter((p) => p.userId === userId),

  getPurchasesByCourse: (courseId) => get().purchases.filter((p) => p.courseId === courseId),

  hasPurchased: (userId, courseId) =>
    get().purchases.some((p) => p.userId === userId && p.courseId === courseId),
}))
