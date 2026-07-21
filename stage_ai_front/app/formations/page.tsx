"use client"

import { useState } from "react"
import { COURSES, isCourseNew } from "@/lib/mock-data"
import { LoginModal } from "@/components/auth/login-modal"
import { InscriptionModal } from "@/components/auth/inscription-modal"
import { Clock, Users, Search, Star, Sparkles, ChevronRight, ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

const CATEGORIES = ["Tous", "Développement Web", "Data Science", "IA & ML", "Design"]
const LEVELS = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"]

export default function FormationsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tous")
  const [level, setLevel] = useState("Tous niveaux")
  const [showLogin, setShowLogin] = useState(false)
  const [showInscription, setShowInscription] = useState(false)

  const published = COURSES.filter((c) => c.published)

  const filtered = published.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "Tous" || c.category === category
    const matchLevel = level === "Tous niveaux" || c.level === level
    return matchSearch && matchCat && matchLevel
  })

  const newCourses = published.filter(isCourseNew)

  return (
    <div className="min-h-screen bg-[#090e1a] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#090e1a]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <span className="text-sm font-bold tracking-tight">StageIA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
            Toutes les formations
          </h1>
          <p className="text-white/50 text-sm max-w-lg">
            {published.length} formations disponibles. Payez via Orange Money et commencez en quelques minutes.
          </p>
        </div>

        {/* New courses banner */}
        {newCourses.length > 0 && (
          <div className="rounded-2xl border border-primary/25 bg-primary/8 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {newCourses.length} nouvelle{newCourses.length > 1 ? "s" : ""} formation{newCourses.length > 1 ? "s" : ""} cette semaine
                </p>
                <p className="text-xs text-white/50">{newCourses.map((c) => c.title).join(" · ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d1220]">{c}</option>)}
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              {LEVELS.map((l) => <option key={l} value={l} className="bg-[#0d1220]">{l}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-white/40 -mt-5">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          {category !== "Tous" && ` dans ${category}`}
          {level !== "Tous niveaux" && ` · ${level}`}
          {search && ` pour "${search}"`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <BookOpen className="size-10 text-white/20" />
            <p className="text-white/50 text-sm">Aucune formation ne correspond à votre recherche.</p>
            <button
              onClick={() => { setSearch(""); setCategory("Tous"); setLevel("Tous niveaux") }}
              className="text-primary text-sm hover:text-primary/80 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => {
              const isNew = isCourseNew(c)
              return (
                <div
                  key={c.id}
                  className="group relative rounded-2xl border border-white/8 bg-white/3 flex flex-col overflow-hidden hover:border-primary/35 hover:bg-white/5 transition-all"
                >
                  {isNew && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      <Sparkles className="size-2.5" />
                      Nouveau
                    </span>
                  )}
                  <div className="h-36 bg-white/3 flex items-center justify-center border-b border-white/6">
                    <span className="text-5xl">{c.thumbnail}</span>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-white/40">{c.level}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-white leading-snug">{c.title}</h2>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed flex-1">{c.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                      <span className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</span>
                      <span className="flex items-center gap-1"><Users className="size-3" />{c.students.length} inscrits</span>
                      <span className="flex items-center gap-1"><Star className="size-3 fill-yellow-400 text-yellow-400" />4.8</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/6">
                      <span className="text-sm font-bold text-white">{c.price.toLocaleString("fr-FR")} FCFA</span>
                      <button
                        onClick={() => setShowInscription(true)}
                        className="flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
                      >
                        Accéder
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/6 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-white">Accédez à toutes ces formations</p>
            <p className="text-sm text-white/50 mt-1">Abonnement mensuel à 35 000 FCFA — paiement Orange Money</p>
          </div>
          <button
            onClick={() => setShowInscription(true)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/85 transition-colors shrink-0"
          >
            S&apos;inscrire maintenant
          </button>
        </div>
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSwitchToInscription={() => { setShowLogin(false); setShowInscription(true) }} />
      <InscriptionModal open={showInscription} onClose={() => setShowInscription(false)} onSwitchToLogin={() => { setShowInscription(false); setShowLogin(true) }} />
    </div>
  )
}
