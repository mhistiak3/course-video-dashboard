import { useMemo, useState } from 'react'
import type { Video, Week } from '@/types'
import { formatIsoDate, isVideoNew, videoKey } from '@/lib/video'

type Props = {
  week: Week
  video: Video
  watched: boolean
  onToggleWatched: (next: boolean) => void
  note: string
  onChangeNote: (next: string) => void
}

export function VideoCard({
  week,
  video,
  watched,
  onToggleWatched,
  note,
  onChangeNote,
}: Props) {
  const [showNotes, setShowNotes] = useState(false)

  const key = useMemo(() => videoKey(week, video), [video, week])
  const isNew = useMemo(() => isVideoNew(video), [video])

  const href = video.url
  const canOpen = Boolean(href && href.startsWith('http'))

  return (
    <div
      className={[
        'theme-card group relative overflow-hidden rounded-2xl border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
        'transition hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--card-strong)',
        watched ? 'opacity-75' : '',
      ].join(' ')}
    >
      <div className="relative flex gap-3">
        <label className="theme-text-secondary mt-0.5 inline-flex select-none items-center gap-2 text-sm">
          <input
            aria-label="Mark as watched"
            type="checkbox"
            checked={watched}
            onChange={(e) => onToggleWatched(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-(--border-strong) bg-(--card) text-[#45aaf2] focus:ring-2 focus:ring-[#45aaf2]/35"
          />
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="theme-text-primary truncate text-base font-semibold tracking-tight">
                  {video.title}
                </h4>
                {isNew && (
                  <span className="theme-card-strong rounded-full border px-2 py-0.5 text-xs font-medium theme-text-primary">
                    New
                  </span>
                )}
                {watched && (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
                    Watched
                  </span>
                )}
              </div>

              <div className="theme-text-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="theme-text-muted h-1.5 w-1.5 rounded-full bg-current/60" />
                  {formatIsoDate(video.date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="theme-text-muted h-1.5 w-1.5 rounded-full bg-current/60" />
                  <span className="truncate">{video.topic}</span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNotes((s) => !s)}
                className="theme-button rounded-xl border px-3 py-1.5 text-sm transition"
              >
                {showNotes ? 'Hide notes' : note ? 'Edit notes' : 'Add notes'}
              </button>
              <a
                href={canOpen ? href : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!canOpen}
                className={[
                  'rounded-xl px-3 py-1.5 text-sm font-medium transition',
                  canOpen
                    ? 'theme-button-primary border'
                    : 'cursor-not-allowed theme-card border theme-text-muted',
                ].join(' ')}
              >
                Watch
              </a>
            </div>
          </div>

          {showNotes && (
            <div className="mt-3">
              <label
                htmlFor={`${key}:notes`}
                className="theme-text-secondary block text-xs font-medium"
              >
                Notes
              </label>
              <textarea
                id={`${key}:notes`}
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="Add quick takeaways, timestamps, homework, etc."
                rows={3}
                className="theme-input mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400/50 focus:ring-2 focus:ring-slate-300/20"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

