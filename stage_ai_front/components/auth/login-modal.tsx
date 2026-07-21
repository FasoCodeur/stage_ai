"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { X, Eye, EyeOff } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onSwitchToInscription: () => void
}

export function LoginModal({ open, onClose, onSwitchToInscription }: Props) {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = login(email, password)
    setLoading(false)
    if (result.success) {
      onClose()
      if (result.role === "admin") router.push("/admin")
      else if (result.role === "professeur") router.push("/professeur")
      else router.push("/etudiant")
    } else {
      setError(result.error || "Email ou mot de passe incorrect.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220] shadow-2xl p-8 flex flex-col gap-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white">Connexion</h2>
          <p className="text-sm text-white/50">Accédez à votre espace d&apos;apprentissage</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 focus:bg-white/8 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/60">Mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 focus:bg-white/8 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="border-t border-white/8 pt-4">
          <p className="text-xs text-white/40 mb-3">Comptes de démonstration</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Admin", email: "admin@stageia.com", password: "admin123" },
              { label: "Professeur", email: "prof@stageia.com", password: "prof123" },
              { label: "Etudiant", email: "etudiant@stageia.com", password: "etudiant123" },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); setError("") }}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-3 py-2 hover:border-white/20 hover:bg-white/7 transition-colors text-left"
              >
                <div>
                  <span className="text-xs font-medium text-white">{acc.label}</span>
                  <span className="block text-[11px] text-white/40">{acc.email}</span>
                </div>
                <span className="text-[11px] text-primary">Remplir</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-white/40">
          Pas encore de compte ?{" "}
          <button
            onClick={onSwitchToInscription}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            S&apos;inscrire
          </button>
        </p>
      </div>
    </div>
  )
}
