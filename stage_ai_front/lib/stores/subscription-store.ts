import { create } from "zustand"
import { SUBSCRIPTIONS, type Subscription } from "@/lib/mock-data"

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

  getSubscriptionByUser: (userId: string) => Subscription | undefined
  getActiveSubscriptions: () => Subscription[]
  hasActiveSubscription: (userId: string) => boolean
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscriptions: SUBSCRIPTIONS,
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
