import { Logger } from '@/types/Logger'

export function createLogger(prefix: string): Logger {
  return {
    info: (message: string) => console.info(`${prefix} ${message}`),
    error: (message: string, error?: unknown) =>
      console.error(`${prefix} ${message}`, error),
  }
}
