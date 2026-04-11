export type LyricLine = {
  time: number
  text: string
}

const LRC_TIMESTAMP_PATTERN = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g

function normalizeMilliseconds(value?: string) {
  if (!value) {
    return 0
  }

  const normalized = value.padEnd(3, '0').slice(0, 3)
  return Number.parseInt(normalized, 10) || 0
}

function parseTimestamp(
  minutes: string,
  seconds: string,
  milliseconds?: string
) {
  return (
    (Number.parseInt(minutes, 10) || 0) * 60_000 +
    (Number.parseInt(seconds, 10) || 0) * 1000 +
    normalizeMilliseconds(milliseconds)
  )
}

export function parseLrc(raw: string): LyricLine[] {
  if (!raw.trim()) {
    return []
  }

  const lines: LyricLine[] = []

  raw.split(/\r?\n/).forEach(line => {
    const timestamps = [...line.matchAll(LRC_TIMESTAMP_PATTERN)]
    const text = line.replace(LRC_TIMESTAMP_PATTERN, '').trim()

    if (!timestamps.length || !text) {
      return
    }

    timestamps.forEach(match => {
      lines.push({
        time: parseTimestamp(match[1] || '0', match[2] || '0', match[3]),
        text,
      })
    })
  })

  return lines.sort((first, second) => first.time - second.time)
}

export function findActiveLyricIndex(lines: LyricLine[], progressMs: number) {
  if (!lines.length || progressMs < lines[0].time) {
    return -1
  }

  let start = 0
  let end = lines.length - 1
  let activeIndex = -1

  while (start <= end) {
    const middle = Math.floor((start + end) / 2)

    if (lines[middle].time <= progressMs) {
      activeIndex = middle
      start = middle + 1
    } else {
      end = middle - 1
    }
  }

  return activeIndex
}
