import { useMemo, useState } from 'react'
import weeksJson from '@/data/weeks.json'
import { WeekSection } from '@/components/WeekSection'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import type { Week } from '@/types'
import { isVideoNew, videoKey } from '@/lib/video'

const weeksData = weeksJson as Week[]

export default function App() {
  const [query, setQuery] = useState('')
  const [weekFilter, setWeekFilter] = useState<string>('all')
  const [watchedByKey, setWatchedByKey] = useLocalStorageState<Record<string, boolean>>(
    'cvd.watched.v1',
    {},
  )
  const [notesByKey, setNotesByKey] = useLocalStorageState<Record<string, string>>(
    'cvd.notes.v1',
    {},
  )

  const weeks = useMemo(() => {
    return weeksData.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredWeeks = useMemo(() => {
    const base = weekFilter === 'all' ? weeks : weeks.filter((w) => w.week === weekFilter)
    if (!normalizedQuery) return base

    return base
      .map((week) => {
        const videos = week.videos.filter((v) => {
          const hay = `${week.week} ${v.title} ${v.topic} ${v.date}`.toLowerCase()
          return hay.includes(normalizedQuery)
        })
        return { ...week, videos }
      })
      .filter((w) => w.videos.length > 0)
  }, [normalizedQuery, weekFilter, weeks])

  const stats = useMemo(() => {
    const allVideos = weeks.flatMap((w) => w.videos.map((v) => ({ w, v })))
    const total = allVideos.length
    const watched = allVideos.reduce((acc, { w, v }) => {
      const k = videoKey(w, v)
      return acc + (watchedByKey[k] ? 1 : 0)
    }, 0)
    const notes = allVideos.reduce((acc, { w, v }) => {
      const k = videoKey(w, v)
      return acc + (notesByKey[k]?.trim() ? 1 : 0)
    }, 0)
    const newlyAdded = allVideos.reduce((acc, { v }) => acc + (isVideoNew(v) ? 1 : 0), 0)
    return { totalWeeks: weeks.length, total, watched, notes, newlyAdded }
  }, [notesByKey, watchedByKey, weeks])

  function setWatched(key: string, next: boolean) {
    setWatchedByKey((prev) => ({ ...prev, [key]: next }))
  }

  function setNote(key: string, next: string) {
    setNotesByKey((prev) => ({ ...prev, [key]: next }))
  }

  function resetProgress() {
    setWatchedByKey({})
    setNotesByKey({})
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070A12]/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-violet-500/80 via-fuchsia-500/70 to-cyan-400/70 shadow-[0_18px_60px_rgba(124,58,237,0.28)]" />
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-50">
                    Course Video Dashboard
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-300">
                    Organize private Facebook group videos by week — fast, structured, and searchable.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[360px]">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search: title, topic, week…"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/25"
                />
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                  <SearchIcon />
                </div>
              </div>

              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="h-[42px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/25 sm:w-[170px]"
              >
                <option value="all">All weeks</option>
                {weeks.map((w) => (
                  <option key={w.week} value={w.week}>
                    {w.week}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetProgress}
                className="h-[42px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10 sm:w-auto"
                title="Clears watched + notes stored locally in this browser"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-200">
            <StatChip label="Weeks" value={stats.totalWeeks} />
            <StatChip label="Videos" value={stats.total} />
            <StatChip label="Watched" value={stats.watched} />
            <StatChip label="Notes" value={stats.notes} />
            {stats.newlyAdded > 0 && <StatChip label="New" value={stats.newlyAdded} tone="cyan" />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {filteredWeeks.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-50">No matches</h2>
            <p className="mt-2 text-sm text-slate-300">
              Try a different search term, or switch back to <span className="text-slate-100">All weeks</span>.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWeeks.map((week, idx) => (
              <WeekSection
                key={week.week}
                week={week}
                watchedByKey={watchedByKey}
                notesByKey={notesByKey}
                onSetWatched={setWatched}
                onSetNote={setNote}
                defaultOpen={idx === 0 && weekFilter === 'all' && !normalizedQuery}
              />
            ))}
          </div>
        )}

        <footer className="mt-10 pb-6 text-center text-xs text-slate-400">
          Data source: local JSON (`src/data/weeks.json`). Watched + notes are stored only in this browser (localStorage).
        </footer>
      </main>
    </div>
  )
}

function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'cyan'
}) {
  const toneClasses =
    tone === 'cyan'
      ? 'border-cyan-300/15 bg-cyan-400/10 text-cyan-100'
      : 'border-white/10 bg-black/20 text-slate-200'
  return (
    <span className={`rounded-full border px-3 py-1 ${toneClasses}`}>
      <span className="text-slate-400">{label}</span>{' '}
      <span className="font-medium">{value}</span>
    </span>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
