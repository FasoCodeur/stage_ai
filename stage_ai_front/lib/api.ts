export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020"

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erreur serveur" }))
    throw new Error(error.message || "Erreur serveur")
  }

  return res.json()
}