"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCourseStore } from "@/lib/stores/course-store"
import { LoginModal } from "@/components/auth/login-modal"
import { InscriptionModal } from "@/components/auth/inscription-modal"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"
import { BookOpen, Users, Award, Zap, ChevronRight, Check, Clock, Star } from "lucide-react"
import Link from "next/link"

const STATS = [
  { label: "Apprenants actifs", value: "2 400+" },
  { label: "Formations disponibles", value: "25" },
  { label: "Taux de réussite", value: "94%" },
  { label: "Partenaires entreprises", value: "40+" },
]

const FEATURES = [
  {
    icon: Zap,
    title: "IA Personnalisée",
    desc: "Un parcours adapté à votre niveau et vos objectifs grâce à l'intelligence artificielle.",
  },
  {
    icon: BookOpen,
    title: "Sandbox Intégré",
    desc: "Pratiquez directement dans le navigateur sans rien installer.",
  },
  {
    icon: Users,
    title: "Stages Virtuels",
    desc: "Mettez en pratique vos compétences avec de vraies entreprises partenaires.",
  },
  {
    icon: Award,
    title: "Certificats Reconnus",
    desc: "Obtenez des certifications validées par les entreprises du secteur.",
  },
]

const PLANS = [
  {
    name: "Achat unique",
    price: "35 000",
    period: "par cours",
    desc: "Accès à vie à un seul cours de votre choix.",
    features: ["Accès illimité au cours", "Sandbox interactif", "Quiz & exercices", "Certificat inclus"],
    cta: "Acheter un cours",
    highlight: false,
    method: "Orange Money",
  },
  {
    name: "Abonnement mensuel",
    price: "35 000",
    period: "/ mois",
    desc: "Accès illimité à toutes les formations de la plateforme.",
    features: [
      "Tous les cours inclus",
      "Nouveaux cours en avant-première",
      "Suivi IA personnalisé",
      "Stages virtuels",
      "Support 24/7",
    ],
    cta: "S'abonner maintenant",
    highlight: true,
    method: "Orange Money · Carte bancaire",
  },
]

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { courses, fetchCourses } = useCourseStore()
  const [showLogin, setShowLogin] = useState(false)
  const [showInscription, setShowInscription] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") router.push("/admin")
      else if (user.role === "professeur") router.push("/professeur")
      else if (user.role === "tuteur") router.push("/tuteur")
      else router.push("/etudiant")
    }
  }, [user, isLoading, router])

  const publishedCourses = courses.filter((c) => c.published).slice(0, 3)

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-[#090e1a] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090e1a]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-base font-bold tracking-tight">StageIA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#formations" className="hover:text-white transition-colors">Formations</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Connexion
            </button>
            <button
              onClick={() => setShowInscription(true)}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/85 transition-colors"
            >
              S&apos;inscrire
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="size-3" />
            Plateforme #1 en Afrique de l&apos;Ouest
          </div>

          <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-balance">
            Formez-vous aux métiers
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#7c8ff8]">
              du numérique
            </span>
            avec l&apos;IA
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-white/60 leading-relaxed text-balance">
            Des formations 100&nbsp;% en ligne, adaptées à votre niveau, avec des stages virtuels en entreprise. Payez facilement via Orange Money.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowInscription(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-base font-semibold text-white hover:bg-primary/85 transition-colors shadow-lg shadow-primary/25"
            >
              Commencer gratuitement
              <ChevronRight className="size-4" />
            </button>
            <a
              href="#formations"
              className="flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3 text-base font-medium text-white/80 hover:border-white/30 hover:text-white transition-colors"
            >
              Voir les formations
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 border-t border-white/8 pt-10 w-full max-w-2xl">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/50 text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formations preview */}
      <section id="formations" className="bg-[#0d1220] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
                Nos formations phares
              </h2>
              <p className="text-white/50 mt-2 text-sm">Choisies par nos apprenants les plus actifs</p>
            </div>
            <Link
              href="/formations"
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              Voir tout le catalogue
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedCourses.map((c) => (
              <div
                key={c.id}
                className="group rounded-2xl border border-white/8 bg-white/4 p-5 flex flex-col gap-4 hover:border-primary/40 hover:bg-white/6 transition-all"
              >
                <div className="h-32 rounded-xl bg-white/5 flex items-center justify-center border border-white/6">
                  <span className="text-5xl">{c.thumbnail}</span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-white/40">{c.level}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug">{c.title}</h3>
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{c.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/6 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</span>
                    <span className="flex items-center gap-1"><Users className="size-3" />{(c.students?.length || 0)}</span>
                    <span className="flex items-center gap-1"><Star className="size-3 fill-yellow-400 text-yellow-400" />4.8</span>
                  </div>
                  <span className="font-bold text-white text-sm">{c.price.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
              Tout ce qu&apos;il vous faut pour réussir
            </h2>
            <p className="text-white/50 mt-3 text-sm max-w-md mx-auto">
              Une plateforme conçue pour le marché africain, accessible depuis n&apos;importe où.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col gap-3"
              >
                <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="bg-[#0d1220] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
              Choisissez votre formule
            </h2>
            <p className="text-white/50 mt-3 text-sm">Paiement sécurisé via Orange Money ou carte bancaire</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 flex flex-col gap-5 ${
                  plan.highlight
                    ? "border-primary bg-primary/8 shadow-xl shadow-primary/15"
                    : "border-white/10 bg-white/4"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-0.5 text-[11px] font-semibold text-white">
                    Recommandé
                  </span>
                )}
                <div>
                  <p className="text-sm text-white/60 font-medium">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-white/40"> FCFA{plan.period}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-2">{plan.desc}</p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() => setShowInscription(true)}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-primary text-white hover:bg-primary/85"
                        : "border border-white/15 text-white hover:border-white/30"
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <p className="text-center text-[11px] text-white/35">{plan.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-balance">
            Prêt à démarrer votre carrière dans le numérique&nbsp;?
          </h2>
          <p className="text-white/50 text-sm">
            Rejoignez 2 400+ apprenants qui ont déjà transformé leur parcours avec StageIA.
          </p>
          <button
            onClick={() => setShowInscription(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary/85 transition-colors shadow-lg shadow-primary/25"
          >
            S&apos;inscrire maintenant
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/8 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">S</span>
            </div>
            <span>StageIA — Plateforme de formation &amp; stages virtuels</span>
          </div>
          <span>© 2025 StageIA. Tous droits réservés.</span>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToInscription={() => { setShowLogin(false); setShowInscription(true) }}
        onForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true) }}
      />
      <InscriptionModal open={showInscription} onClose={() => setShowInscription(false)} onSwitchToLogin={() => { setShowInscription(false); setShowLogin(true) }} />
      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => { setShowForgotPassword(false); setShowLogin(true) }}
      />
    </div>
  )
}
