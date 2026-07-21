"use client"

import { useState } from "react"
import { Course, PURCHASES } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { X, Phone, Check, Clock } from "lucide-react"

interface Props {
  course: Course
  open: boolean
  onClose: () => void
}

type Step = "form" | "processing" | "success"

export function OrangeMoneyModal({ course, open, onClose }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>("form")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const reset = () => {
    setStep("form")
    setPhone("")
    setPhoneError("")
    onClose()
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.match(/^(\+?221|0)?7[5-8]\d{7}$/)) {
      setPhoneError("Numéro Orange Money invalide (ex: 77 000 00 00)")
      return
    }
    setPhoneError("")
    setStep("processing")
    setTimeout(() => {
      // Simulate adding a purchase to mock data in-memory
      if (user) {
        PURCHASES.push({
          userId: user.id,
          courseId: course.id,
          method: "orange_money",
          purchasedAt: new Date().toISOString().split("T")[0],
        })
      }
      setStep("success")
    }, 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={reset} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {step !== "processing" && (
          <button
            onClick={reset}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        )}

        <div className="p-7 flex flex-col gap-5">
          {step === "form" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-foreground">Acheter ce cours</h2>
                <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
              </div>

              {/* Course summary */}
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  {course.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.level} · {course.duration}h</p>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{course.price.toLocaleString("fr-FR")} FCFA</p>
              </div>

              {/* Orange Money badge */}
              <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="size-9 rounded-xl bg-[#FF6500] flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Orange Money</p>
                  <p className="text-xs text-muted-foreground">Paiement mobile sécurisé</p>
                </div>
              </div>

              <form onSubmit={handlePay} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Numéro Orange Money</label>
                  <div className="flex items-center rounded-lg border overflow-hidden focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-colors">
                    <span className="px-3 text-sm text-muted-foreground border-r bg-muted/50 py-2.5">+221</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77 000 00 00"
                      required
                      className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
                    />
                  </div>
                  {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                </div>

                <div className="rounded-lg border bg-muted/20 p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Formation</span>
                    <span className="text-foreground truncate max-w-40 text-right">{course.title}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Montant</span>
                    <span className="font-semibold text-foreground">{course.price.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Accès</span>
                    <span className="text-foreground">À vie</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Vous recevrez un code USSD pour confirmer le paiement sur votre téléphone.
                </p>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF6500] py-3 text-sm font-semibold text-white hover:bg-[#FF6500]/85 transition-colors"
                >
                  <Phone className="size-4" />
                  Payer {course.price.toLocaleString("fr-FR")} FCFA
                </button>
              </form>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <div className="size-16 rounded-full border-2 border-orange-500/30 bg-orange-500/10 flex items-center justify-center">
                <Clock className="size-7 text-orange-500 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Traitement en cours...</p>
                <p className="text-sm text-muted-foreground mt-1">Confirmez le paiement sur votre téléphone</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-orange-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="size-16 rounded-full bg-chart-3/10 border border-chart-3/30 flex items-center justify-center">
                <Check className="size-8 text-chart-3" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Paiement confirmé !</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Vous avez maintenant accès à <span className="font-medium text-foreground">{course.title}</span> à vie.
                </p>
              </div>
              <button
                onClick={reset}
                className="rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/85 transition-colors"
              >
                Accéder au cours
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
