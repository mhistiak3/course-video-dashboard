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
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur',
        'transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10',
        watched ? 'opacity-75' : '',
      ].join(' ')}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -inset-16 bg-linear-to-r from-violet-500/15 via-cyan-400/10 to-fuchsia-400/15 blur-2xl" />
      </div>

      <div className="relative flex gap-3">
        <label className="mt-0.5 inline-flex select-none items-center gap-2 text-sm text-slate-200">
          <input
            aria-label="Mark as watched"
            type="checkbox"
            checked={watched}
            onChange={(e) => onToggleWatched(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-violet-400 focus:ring-2 focus:ring-violet-400/60"
          />
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-base font-semibold tracking-tight text-slate-100">
                  {video.title}
                </h4>
                {isNew && (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-200">
                    New
                  </span>
                )}
                {watched && (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
                    Watched
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
                  {formatIsoDate(video.date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
                  <span className="truncate">{video.topic}</span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNotes((s) => !s)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
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
                    ? 'bg-linear-to-r from-violet-500/70 via-fuchsia-500/65 to-cyan-400/60 text-white hover:from-violet-500/85 hover:via-fuchsia-500/80 hover:to-cyan-400/75'
                    : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-400',
                ].join(' ')}
              >
                Open
              </a>
            </div>
          </div>

          {showNotes && (
            <div className="mt-3">
              <label
                htmlFor={`${key}:notes`}
                className="block text-xs font-medium text-slate-300"
              >
                Notes
              </label>
              <textarea
                id={`${key}:notes`}
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="Add quick takeaways, timestamps, homework, etc."
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/30"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

