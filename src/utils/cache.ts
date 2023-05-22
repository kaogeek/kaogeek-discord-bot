export interface Cache {
  [key: string]: unknown
}

const cache: Cache = {}

/**
 * Saves a value in the cache with the specified key.
 *
 * @param {string} key - The key to associate with the value in the cache.
 * @param {unknown} value - The value to be saved in the cache.
 */
export function saveCache(key: string, value: unknown): void {
  cache[key] = value
}

/**
 * Retrieves the value associated with the specified key from the cache.
 *
 * @param {string} key - The key of the value to retrieve from the cache.
 * @returns {unknown} The value associated with the specified key, or undefined if the key does not exist in the cache.
 */
export function getCache(key: string): unknown {
  return cache[key]
}

/**
 * Removes the value associated with the specified key from the cache.
 *
 * @param {string} key - The key of the value to remove from the cache.
 * @returns {void} The removed value, or undefined if the key does not exist in the cache.
 */
export function removeCache(key: string): void {
  return (cache[key] = undefined)
}
