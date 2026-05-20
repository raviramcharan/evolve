import Image from 'next/image'
import Link from 'next/link'
import { ProgressPhoto } from '@/types'
import { formatDate, weekLabel } from '@/lib/formatters'

type PhotoWithSignedUrl = ProgressPhoto & { signed_url: string | null }

interface PhotoGridProps {
  photos: PhotoWithSignedUrl[]
}

function groupByWeek(photos: PhotoWithSignedUrl[]): Map<number, PhotoWithSignedUrl[]> {
  const map = new Map<number, PhotoWithSignedUrl[]>()
  for (const photo of photos) {
    const existing = map.get(photo.week_number) ?? []
    map.set(photo.week_number, [...existing, photo])
  }
  return map
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted text-sm">No photos yet.</p>
        <p className="text-muted text-xs mt-1">Upload your first progress photo to get started.</p>
      </div>
    )
  }

  const grouped = groupByWeek(photos)
  const sortedWeeks = Array.from(grouped.keys()).sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-6">
      {sortedWeeks.map((week) => {
        const weekPhotos = grouped.get(week) ?? []
        return (
          <div key={week}>
            <p className="text-sm font-semibold text-muted mb-3">{weekLabel(week)}</p>
            <div className="grid grid-cols-3 gap-2">
              {weekPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={photo.signed_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface block group"
                >
                  {photo.signed_url ? (
                    <Image
                      src={photo.signed_url}
                      alt={`Progress photo week ${photo.week_number}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted text-xs">Unavailable</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-[10px]">{formatDate(photo.taken_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
