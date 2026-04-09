import { useEffect, useMemo, useState } from 'react'

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export function useLocalStorageState<T extends Json>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return initialValue
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  }, [initialValue, key])

  const [value, setValue] = useState<T>(initial)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [key, value])

  return [value, setValue]
}

