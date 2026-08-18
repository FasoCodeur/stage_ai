import { create } from "zustand"
import { type Subscription } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"

interface SubscriptionState {
  subscriptions: Subscription[]
  selectedSubscription: Subscription | null
  isLoading: boolean

  setSubscriptions: (subscriptions: Subscription[]) => void
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (userId: string, data: Partial<Subscription>) => void
  cancelSubscription: (userId: string) => void
  setSelectedSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void

  // Actions API
  fetchAllSubscriptions: () => Promise<void>
  fetchSubscriptionsByUser: (userId: string) => Promise<void>
  createSubscription: (userId: string, plan?: string) => Promise<Subscription>
  cancelSubscriptionApi: (userId: string) => Promise<void>
  hasActiveSubscriptionApi: (userId: string) => Promise<boolean>

  getSubscriptionByUser: (userId: string) => Subscription | undefined
  getActiveSubscriptions: () => Subscription[]
  hasActiveSubscription: (userId: string) => boolean
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscriptions: [],
  selectedSubscription: null,
  isLoading: false,

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, subscription],
    })),

  updateSubscription: (userId, data) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.userId === userId ? { ...s, ...data } : s
      ),
    })),

  cancelSubscription: (userId) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.userId === userId ? { ...s, status: "expiree" } : s
      ),
    })),

  setSelectedSubscription: (selectedSubscription) => set({ selectedSubscription }),
  setLoading: (isLoading) => set({ isLoading }),

  // ── Actions API ──
  fetchAllSubscriptions: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Subscription[]>("/subscriptions")
      set({ subscriptions: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  fetchSubscriptionsByUser: async (userId) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<Subscription[]>(`/subscriptions/user/${userId}`)
      set({ subscriptions: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createSubscription: async (userId, plan = "mensuel") => {
    const data = await apiFetch<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ userId, plan }),
    })
    set((state) => ({
      subscriptions: [...state.subscriptions, data],
    }))
    return data
  },

  cancelSubscriptionApi: async (userId) => {
    await apiFetch<void>(`/subscriptions/user/${userId}`, {
      method: "DELETE",
    })
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.userId === userId ? { ...s, status: "expiree" } : s
      ),
    }))
  },

  hasActiveSubscriptionApi: async (userId) => {
    const data = await apiFetch<Subscription | null>(`/subscriptions/user/${userId}/active`)
    return !!data && data.status === "active" && new Date(data.endDate) >= new Date()
  },

  getSubscriptionByUser: (userId) => get().subscriptions.find((s) => s.userId === userId),

  getActiveSubscriptions: () =>
    get().subscriptions.filter(
      (s) => s.status === "active" && new Date(s.endDate) >= new Date()
    ),

  hasActiveSubscription: (userId) => {
    const sub = get().getSubscriptionByUser(userId)
    return !!sub && sub.status === "active" && new Date(sub.endDate) >= new Date()
  },
}))