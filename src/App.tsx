import { useEffect, useMemo, useState } from 'react'
import weeksJson from '@/data/weeks.json'
import { WeekSection } from '@/components/WeekSection'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import type { Week } from '@/types'
import { isVideoNew, videoKey } from '@/lib/video'

const weeksData = weeksJson as Week[]

export default function App() {
  const [query, setQuery] = useState('')
  const [weekFilter, setWeekFilter] = useState<string>('all')
  const [theme, setTheme] = useLocalStorageState<'dark' | 'light'>(
    'cvd.theme.v1',
    'dark',
  )
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

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
  }, [theme])

  function setWatched(key: string, next: boolean) {
    setWatchedByKey((prev) => ({ ...prev, [key]: next }))
  }

  function setNote(key: string, next: string) {
    setNotesByKey((prev) => ({ ...prev, [key]: next }))
  }

  return (
    <div className="min-h-full">
      <header className="theme-header sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-3">
                <div className="min-w-0">
                  <h1 className="theme-text-primary truncate text-2xl font-semibold tracking-tight">
                    Course Video Dashboard
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">
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
                  className="theme-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none focus:border-[#45aaf2]/70 focus:ring-2 focus:ring-[#45aaf2]/30"
                />
                <div className="theme-text-muted pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SearchIcon />
                </div>
              </div>

              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="theme-input h-[42px] w-full rounded-2xl border px-3 text-sm outline-none transition focus:border-[#45aaf2]/70 focus:ring-2 focus:ring-[#45aaf2]/30 sm:w-[170px]"
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
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className="theme-button-primary inline-flex h-[42px] w-full items-center justify-center rounded-2xl border px-3 text-sm transition sm:w-auto"
                title="Toggle light and dark mode"
                aria-label="Toggle light and dark mode"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <StatChip label="Weeks" value={stats.totalWeeks} />
            <StatChip label="Videos" value={stats.total} />
            <StatChip label="Watched" value={stats.watched} />
            <StatChip label="Notes" value={stats.notes} />
            {stats.newlyAdded > 0 && <StatChip label="New" value={stats.newlyAdded} tone="subtle" />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {filteredWeeks.length === 0 ? (
          <div className="theme-card rounded-3xl border p-8 text-center">
            <h2 className="theme-text-primary text-lg font-semibold">No matches</h2>
            <p className="theme-text-secondary mt-2 text-sm">
              Try a different search term, or switch back to <span className="theme-text-primary">All weeks</span>.
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

        <footer className="theme-text-muted mt-10 pb-6 text-center text-xs">
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
  tone?: 'default' | 'subtle'
}) {
  const toneClasses =
    tone === 'subtle'
      ? 'theme-card-strong theme-text-primary'
      : 'theme-card theme-text-secondary'
  return (
    <span className={`rounded-full border px-3 py-1 ${toneClasses}`}>
      <span className="theme-text-muted">{label}</span>{' '}
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

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
