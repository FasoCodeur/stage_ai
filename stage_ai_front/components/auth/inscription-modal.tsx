"use client"

import { useState } from "react"
import { X, Check, ChevronRight, Phone } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

type Step = "info" | "plan" | "payment" | "success"

const PLANS = [
  {
    id: "mensuel",
    name: "Abonnement mensuel",
    price: "35 000 FCFA / mois",
    desc: "Accès illimité à toutes les formations",
    features: ["Tous les cours inclus", "Stages virtuels", "Suivi IA", "Support 24/7"],
    badge: "Recommandé",
  },
  {
    id: "unique",
    name: "Achat unique",
    price: "35 000 FCFA / cours",
    desc: "Accès à vie à un cours de votre choix",
    features: ["1 cours au choix", "Sandbox intégré", "Certificat inclus"],
    badge: null,
  },
]

export function InscriptionModal({ open, onClose, onSwitchToLogin }: Props) {
  const [step, setStep] = useState<Step>("info")
  const [plan, setPlan] = useState("mensuel")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "" })

  const reset = () => {
    setStep("info")
    setPlan("mensuel")
    setPhone("")
    setPhoneError("")
    setForm({ nom: "", prenom: "", email: "", password: "" })
    onClose()
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("plan")
  }

  const handlePlanNext = () => setStep("payment")

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.match(/^(\+?221|0)?7[5-8]\d{7}$/)) {
      setPhoneError("Numéro Orange Money invalide (ex: 77 000 00 00)")
      return
    }
    setPhoneError("")
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setStep("success")
    }, 2200)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={reset} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1220] shadow-2xl overflow-hidden">
        {/* Step progress bar */}
        <div className="h-1 bg-white/8">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: step === "info" ? "25%" : step === "plan" ? "55%" : step === "payment" ? "80%" : "100%" }}
          />
        </div>

        <div className="p-8 flex flex-col gap-6">
          <button
            onClick={reset}
            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>

          {/* Step: info */}
          {step === "info" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Créer un compte</h2>
                <p className="text-sm text-white/50 mt-1">Rejoignez 2 400+ apprenants sur StageIA</p>
              </div>
              <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {(["nom", "prenom"] as const).map((field) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-white/60 capitalize">{field === "nom" ? "Nom" : "Prénom"}</label>
                      <input
                        type="text"
                        required
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors"
                        placeholder={field === "nom" ? "Diallo" : "Amadou"}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60">Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors mt-1"
                >
                  Continuer
                  <ChevronRight className="size-4" />
                </button>
              </form>
              <p className="text-center text-xs text-white/40">
                Déjà un compte ?{" "}
                <button onClick={onSwitchToLogin} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Se connecter
                </button>
              </p>
            </>
          )}

          {/* Step: plan */}
          {step === "plan" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Choisissez votre formule</h2>
                <p className="text-sm text-white/50 mt-1">Vous pourrez changer à tout moment</p>
              </div>
              <div className="flex flex-col gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`relative rounded-xl border p-4 text-left transition-all ${
                      plan === p.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/4 hover:border-white/20"
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                        {p.badge}
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${plan === p.id ? "border-primary" : "border-white/30"}`}>
                        {plan === p.id && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-primary font-medium mt-0.5">{p.price}</p>
                        <p className="text-xs text-white/50 mt-1">{p.desc}</p>
                        <ul className="mt-2 flex flex-col gap-1">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-white/60">
                              <Check className="size-3 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handlePlanNext}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors"
              >
                Continuer vers le paiement
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          {/* Step: payment */}
          {step === "payment" && (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Paiement Orange Money</h2>
                <p className="text-sm text-white/50 mt-1">
                  {plan === "mensuel" ? "Abonnement mensuel — 35 000 FCFA" : "Achat unique — 35 000 FCFA"}
                </p>
              </div>

              {/* Orange Money card */}
              <div className="rounded-xl border border-[#FF6500]/25 bg-[#FF6500]/8 p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#FF6500] flex items-center justify-center shrink-0">
                  <Phone className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Orange Money</p>
                  <p className="text-xs text-white/50">Paiement mobile sécurisé — Afrique de l&apos;Ouest</p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60">Numéro Orange Money</label>
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden focus-within:border-[#FF6500]/50 transition-colors">
                    <span className="px-3 text-sm text-white/40 border-r border-white/10 bg-white/3 py-2.5">+221</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77 000 00 00"
                      required
                      className="flex-1 px-3 py-2.5 text-sm text-white placeholder:text-white/30 bg-transparent outline-none"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-400">{phoneError}</p>
                  )}
                </div>

                <div className="rounded-lg bg-white/4 border border-white/8 p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between text-white/50">
                    <span>Formule</span>
                    <span className="text-white">{plan === "mensuel" ? "Abonnement mensuel" : "Achat unique"}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Montant</span>
                    <span className="text-white font-semibold">35 000 FCFA</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Mode de paiement</span>
                    <span className="text-[#FF6500]">Orange Money</span>
                  </div>
                </div>

                <p className="text-xs text-white/40 text-center">
                  Vous recevrez un code USSD sur votre téléphone pour confirmer le paiement.
                </p>

                <button
                  type="submit"
                  disabled={paying}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF6500] py-3 text-sm font-semibold text-white hover:bg-[#FF6500]/85 transition-colors disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Phone className="size-4" />
                      Payer avec Orange Money
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step: success */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="size-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <Check className="size-8 text-green-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">Paiement confirmé !</h2>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">
                  Bienvenue sur StageIA, {form.prenom}. Votre compte est activé.
                  {plan === "mensuel"
                    ? " Votre abonnement mensuel est actif."
                    : " Vous pouvez maintenant accéder à votre cours."}
                </p>
              </div>
              <button
                onClick={() => { reset(); }}
                className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/85 transition-colors"
              >
                Accéder à la plateforme
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
