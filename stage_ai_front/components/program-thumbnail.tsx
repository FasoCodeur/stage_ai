"use client"

import { ImageIcon } from "lucide-react"
import { resolveMediaUrl } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProgramThumbnailProps {
  /** URL renvoyée par POST /uploads, URL absolue… ou ancien emoji. */
  value?: string | null
  alt?: string
  className?: string
  textClassName?: string
  iconClassName?: string
}

/**
 * Affiche le logo d'un programme :
 * - l'image téléversée si elle existe,
 * - l'emoji pour les anciennes données,
 * - une icône neutre si aucun logo (champ nullable).
 */
export function ProgramThumbnail({
  value,
  alt = "Logo du programme",
  className,
  textClassName = "text-3xl",
  iconClassName = "size-6",
}: ProgramThumbnailProps) {
  const src = resolveMediaUrl(value)

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={cn("object-cover", className)} />
    )
  }

  if (value) {
    return (
      <span aria-hidden="true" className={cn("flex items-center justify-center", textClassName, className)}>
        {value}
      </span>
    )
  }

  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center text-muted-foreground", className)}>
      <ImageIcon className={iconClassName} />
    </span>
  )
}
