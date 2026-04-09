import { useState } from 'react'
import type { Week } from '@/types'
import { formatWeekRange, videoKey } from '@/lib/video'
import { VideoCard } from '@/components/VideoCard'

type Props = {
  week: Week
  watchedByKey: Record<string, boolean>
  notesByKey: Record<string, string>
  onSetWatched: (key: string, next: boolean) => void
  onSetNote: (key: string, next: string) => void
  defaultOpen?: boolean
}

export function WeekSection({
  week,
  watchedByKey,
  notesByKey,
  onSetWatched,
  onSetNote,
  defaultOpen,
}: Props) {
  const range = formatWeekRange(week)
  const videoCount = week.videos.length
  const [isOpen, setIsOpen] = useState(Boolean(defaultOpen))

  return (
    <details
      className="theme-card group rounded-3xl border shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-5 py-4 outline-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="theme-card inline-flex h-8 w-8 items-center justify-center rounded-xl border theme-text-primary">
                <Chevron />
              </span>
              <div className="min-w-0">
                <h3 className="theme-text-primary truncate text-lg font-semibold tracking-tight">
                  {week.week}
                </h3>
                <p className="theme-text-secondary mt-0.5 text-sm">
                  {range ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="theme-card rounded-full border px-3 py-1 text-sm theme-text-secondary">
              {videoCount} {videoCount === 1 ? 'video' : 'videos'}
            </span>
          </div>
        </div>
      </summary>

      <div className="border-t border-(--border) px-5 pb-5 pt-4">
        <div className="grid gap-3">
          {week.videos
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((video) => {
              const key = videoKey(week, video)
              return (
                <VideoCard
                  key={key}
                  week={week}
                  video={video}
                  watched={Boolean(watchedByKey[key])}
                  onToggleWatched={(next) => onSetWatched(key, next)}
                  note={notesByKey[key] ?? ''}
                  onChangeNote={(next) => onSetNote(key, next)}
                />
              )
            })}
        </div>
      </div>
    </details>
  )
}

function Chevron() {
  return (
    <svg
      className="theme-text-secondary h-4 w-4 transition-transform group-open:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

