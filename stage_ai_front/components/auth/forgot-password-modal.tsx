"use client"

import { useState } from "react"
import { X, Mail, Check, ArrowLeft } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface Props {
  open: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ open, onClose, onBackToLogin }: Props) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'email. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setLoading(false)
    setSent(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220] shadow-2xl p-8 flex flex-col gap-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>

        {!sent ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
              <p className="text-sm text-white/50">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/60">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 focus:bg-white/8 transition-colors"
                  />
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
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="size-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <Check className="size-8 text-green-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Email envoyé !</h2>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                Si un compte existe avec l'adresse <span className="text-white font-medium">{email}</span>,
                vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        <button
          onClick={() => { setEmail(""); setError(""); setLoading(false); setSent(false); onBackToLogin() }}
          className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </button>
      </div>
    </div>
  )
}