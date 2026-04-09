import type { Video, Week } from '@/types'

export function formatIsoDate(iso: string): string {
  // Keep it fast + predictable: YYYY-MM-DD -> Apr 9, 2026 (local)
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatWeekRange(week: Week): string | null {
  if (!week.startDate) return null
  if (week.endDate) return `${formatIsoDate(week.startDate)} → ${formatIsoDate(week.endDate)}`
  return formatIsoDate(week.startDate)
}

export function videoKey(week: Week, video: Video): string {
  // Prefer URL as stable unique identifier; fall back to date+title+week.
  const base = (video.url && video.url !== 'https://facebook.com/...' ? video.url : '') || `${week.week}|${video.date}|${video.title}`
  return `video:${hashString(base)}`
}

export function isVideoNew(video: Video, now = new Date()): boolean {
  if (!video.addedAt) return false
  const added = new Date(video.addedAt)
  if (Number.isNaN(added.getTime())) return false
  const diffMs = now.getTime() - added.getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return diffMs >= 0 && diffMs <= sevenDaysMs
}

function hashString(input: string): string {
  // Tiny non-crypto hash (FNV-1a-ish) to keep keys short.
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

