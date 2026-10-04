import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEntreprisesStore } from "@/lib/stores/entreprises-store"
import { type Entreprise } from "@/lib/mock-data"

/**
 * Entreprise de rattachement du tuteur connecté.
 *
 * L'API résout le rattachement dans l'ordre : table de liaison « tuteur_entreprise »
 * puis colonne `users.entrepriseId` du compte. On obtient donc l'entreprise réelle
 * même quand la colonne du compte n'a pas été renseignée.
 */
export function useEntrepriseCourante() {
  const { user } = useAuth()
  const { getEntrepriseOfTuteur } = useEntreprisesStore()

  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setEntreprise(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    getEntrepriseOfTuteur(user.id)
      .then((found) => {
        if (!cancelled) setEntreprise(found ?? null)
      })
      .catch(() => {
        if (!cancelled) setEntreprise(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, getEntrepriseOfTuteur])

  return {
    entreprise,
    entrepriseId: entreprise?.id ?? null,
    isLoading,
  }
}
