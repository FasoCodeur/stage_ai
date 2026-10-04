"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { ProgramThumbnail } from "@/components/program-thumbnail"
import { getFriendlyErrorMessage, uploadImage } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  /** URL du logo (ou null si aucun logo). */
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  hint?: string
  disabled?: boolean
  className?: string
}

/**
 * Champ de téléversement d'image avec prévisualisation.
 * Envoie le fichier dans le dossier « uploads » du backend et stocke son URL.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Logo du programme",
  hint = "PNG, JPG, WEBP ou GIF — 5 Mo maximum.",
  disabled,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Réinitialise l'input pour pouvoir resélectionner le même fichier
    event.target.value = ""
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Le téléversement de l'image a échoué."))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium leading-none">{label}</span>

      <div className="flex items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-primary/5">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <ProgramThumbnail
              value={value}
              className="size-16"
              textClassName="text-3xl"
              iconClassName="size-6"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ImagePlus className="size-3.5" />
              {value ? "Changer l'image" : "Choisir une image"}
            </button>

            {value && !uploading && (
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setError("")
                }}
                disabled={disabled}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Trash2 className="size-3.5" />
                Supprimer
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleSelect}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
