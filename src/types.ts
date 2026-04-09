export type IsoDate = `${number}-${number}-${number}`

export type Video = {
  /** ISO date string (YYYY-MM-DD) */
  date: IsoDate
  title: string
  topic: string
  url: string

  /**
   * Optional metadata used only by the dashboard UI.
   * Keep your core JSON minimal if you want; these are safe to omit.
   */
  addedAt?: string
}

export type Week = {
  week: string
  startDate: IsoDate
  endDate?: IsoDate
  videos: Video[]
}

