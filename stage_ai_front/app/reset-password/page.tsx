"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    try {
      await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Lien invalide ou expiré. Veuillez refaire une demande.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090e1a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220] shadow-2xl p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-base font-bold tracking-tight">StageIA</span>
        </div>
        <ResetBody
          token={token}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          success={success}
          loading={loading}
          onSubmit={handleSubmit}
          onGoHome={() => router.push("/")}
        />
      </div>
    </div>
  )
}

interface ResetBodyProps {
  token: string
  newPassword: string
  setNewPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  error: string
  success: boolean
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onGoHome: () => void
}

function ResetBody({
  token,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  success,
  loading,
  onSubmit,
  onGoHome,
}: ResetBodyProps) {
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <div>
          <h1 className="text-lg font-bold">Lien invalide</h1>
          <p className="text-sm text-white/50 mt-1">
            Ce lien de réinitialisation est incomplet ou a expiré.
          </p>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="size-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Mot de passe réinitialisé !</h1>
          <p className="text-sm text-white/50 mt-1">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </div>
        <button
          onClick={onGoHome}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/85 transition-colors"
        >
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Nouveau mot de passe</h1>
        <p className="text-sm text-white/50">Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/60">Nouveau mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
              required
              minLength={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/60">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <Link
        href="/"
        className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Retour à l&apos;accueil
      </Link>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090e1a] flex items-center justify-center">
          <Loader2 className="size-6 text-white/40 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
