export interface Cache {
  [key: string]: unknown
}

const cache: Cache = {}

export function saveCache(key: string, value: unknown): void {
  cache[key] = value
}

export function getCache(key: string): unknown {
  return cache[key]
}
