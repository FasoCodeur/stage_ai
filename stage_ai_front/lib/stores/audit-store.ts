import { create } from "zustand"

export type AuditAction = "create" | "update" | "delete"

export interface AuditLog {
  id: string
  action: AuditAction
  entity: "user" | "course" | "enrollment" | "stage-request"
  entityId: string
  description: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  createdAt: string
}

interface AuditState {
  logs: AuditLog[]
  addLog: (log: Omit<AuditLog, "id" | "createdAt">) => void
  getLogsByEntity: (entity: AuditLog["entity"]) => AuditLog[]
  getRecentLogs: (limit?: number) => AuditLog[]
}

export const useAuditStore = create<AuditState>()((set, get) => ({
  logs: [],

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        },
        ...state.logs,
      ],
    })),

  getLogsByEntity: (entity) => get().logs.filter((l) => l.entity === entity),

  getRecentLogs: (limit = 20) => get().logs.slice(0, limit),
}))
