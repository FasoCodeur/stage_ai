export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020"

/** Message affiché lorsque l'API est injoignable (serveur arrêté, réseau coupé, CORS…). */
export const NETWORK_ERROR_MESSAGE =
  "Impossible de contacter le serveur. Vérifiez votre connexion internet, puis réessayez dans quelques instants."

/** Messages génériques par code HTTP, en français et compréhensibles par tous. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Les informations envoyées ne sont pas valides. Vérifiez votre saisie puis réessayez.",
  401: "Votre session a expiré ou vos identifiants sont incorrects. Veuillez vous reconnecter.",
  403: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
  404: "L'élément demandé est introuvable. Il a peut-être été supprimé.",
  405: "Cette action n'est pas autorisée.",
  408: "Le serveur met trop de temps à répondre. Veuillez réessayer.",
  409: "Ces informations existent déjà. Vérifiez votre saisie.",
  413: "Le contenu envoyé est trop volumineux.",
  422: "Certaines informations sont invalides. Merci de vérifier le formulaire.",
  429: "Trop de tentatives en peu de temps. Merci de patienter un instant.",
  500: "Le serveur a rencontré un problème inattendu. Merci de réessayer plus tard.",
  502: "Le service est temporairement indisponible. Réessayez dans quelques instants.",
  503: "Le service est momentanément en maintenance. Réessayez dans quelques instants.",
  504: "Le serveur met trop de temps à répondre. Réessayez dans quelques instants.",
}

/**
 * Fragments de messages techniques (validation, base de données…) qui n'ont
 * aucun sens pour un utilisateur et ne doivent jamais être affichés bruts.
 */
const TECHNICAL_HINTS = [
  "should not exist",
  "must be ",
  "property ",
  "nested property",
  "an instance of",
  "is not supported",
  "expected ",
  "cannot be ",
  "query failed",
  "queryfailederror",
  "does not exist",
  "syntax error",
  "invalid input syntax",
  "drivererror",
  "typeorm",
  "sql",
  "stack",
  "error:",
]

function isTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return TECHNICAL_HINTS.some((hint) => lower.includes(hint))
}

/**
 * Détermine un message lisible à partir du corps d'une réponse en erreur.
 * On garde les messages métier du serveur (déjà rédigés en français),
 * on masque les messages techniques et on retombe sur un message par code HTTP.
 */
export function extractErrorMessage(payload: unknown, status?: number): string {
  const fallback =
    (status !== undefined ? STATUS_MESSAGES[status] : undefined) ??
    "Une erreur inattendue est survenue. Veuillez réessayer."

  const raw = (payload as { message?: unknown } | null)?.message

  // class-validator renvoie un tableau de messages techniques → on l'ignore
  if (typeof raw === "string") {
    const message = raw.trim()
    if (message && !isTechnicalMessage(message)) return message
  }

  return fallback
}

/**
 * Convertit n'importe quelle erreur (réseau, HTTP, JS) en message
 * compréhensible par l'utilisateur final.
 */
export function getFriendlyErrorMessage(
  err: unknown,
  fallback = "Une erreur inattendue est survenue. Veuillez réessayer.",
): string {
  const message = err instanceof Error ? err.message?.trim() : typeof err === "string" ? err.trim() : ""

  if (!message) return fallback

  if (
    /failed to fetch|network ?error|load failed|fetch failed|network request failed|connection|econnrefused|econnreset|etimedout|enotfound|socket hang up|timed out|offline/i.test(
      message,
    )
  ) {
    return NETWORK_ERROR_MESSAGE
  }

  if (isTechnicalMessage(message)) return fallback

  return message
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let roleHeader: Record<string, string> = {}
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("stageia_user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.role) roleHeader = { "x-user-role": user.role }
      } catch {
        // ignore
      }
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...roleHeader,
        ...(options?.headers || {}),
      },
      ...options,
    })
  } catch {
    // Requête jamais aboutie : API arrêtée, pas de réseau, CORS…
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!res.ok) {
    let payload: unknown = null
    try {
      payload = await res.json()
    } catch {
      // corps vide ou non-JSON → on garde le message générique du code HTTP
    }
    throw new Error(extractErrorMessage(payload, res.status))
  }

  // Certaines réponses (DELETE…) n'ont pas de contenu
  if (res.status === 204) return undefined as T

  try {
    return (await res.json()) as T
  } catch {
    return undefined as T
  }
}

/** Construit l'URL absolue d'un fichier servi par l'API (ex. « /uploads/xxx.png »). */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null

  const value = path.trim()
  if (!value) return null

  if (/^(https?:|data:|blob:)/i.test(value)) return value
  if (value.startsWith("/")) return `${API_URL}${value}`

  // Ni URL absolue ni chemin servi par l'API : ancien emoji par exemple
  return null
}

/**
 * Téléverse une image vers l'API (dossier « uploads » du backend).
 * Retourne l'URL relative renvoyée par le serveur (ex. « /uploads/xxx.png »).
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  let res: Response
  try {
    // Aucun Content-Type manuel : le navigateur ajoute le boundary du multipart
    res = await fetch(`${API_URL}/uploads`, { method: "POST", body: formData })
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!res.ok) {
    let payload: unknown = null
    try {
      payload = await res.json()
    } catch {
      // corps vide ou non-JSON → message générique du code HTTP
    }
    throw new Error(extractErrorMessage(payload, res.status))
  }

  const data = (await res.json().catch(() => null)) as { url?: string } | null
  if (!data?.url) {
    throw new Error("L'image n'a pas pu être enregistrée. Veuillez réessayer.")
  }

  return data.url
}
