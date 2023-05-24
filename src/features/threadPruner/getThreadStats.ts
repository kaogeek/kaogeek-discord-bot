import { APIThreadChannel, SnowflakeUtil } from 'discord.js'

export interface PruningCriteria {
  name: string
  threadIds: string[]
}

export function getThreadStats(threads: APIThreadChannel[]) {
  threads = [...threads].sort(
    (a, b) => +(b.last_message_id ?? 0) - +(a.last_message_id ?? 0),
  )

  // Create pruning criteria
  let pruningCriteria: PruningCriteria[] = []

  // By last message timestamp
  for (const h of [72, 48, 24, 6, 3, 1]) {
    const name = `Prune threads with last message older than ${h}h`
    const threadIds = threads
      .filter((thread) => {
        const timestamp = thread.last_message_id
          ? SnowflakeUtil.timestampFrom(thread.last_message_id)
          : Number.POSITIVE_INFINITY
        return Date.now() - timestamp > 3600e3 * h
      })
      .map((t) => t.id)
    pruningCriteria.push({ name, threadIds })
  }

  // By number of messages
  for (const n of [100]) {
    const name = `Prune bottom ${n} threads`
    const threadIds = threads
      .filter((_, index) => index >= threads.length - n)
      .map((t) => t.id)
    pruningCriteria.push({ name, threadIds })
  }

  // Remove empty criteria
  pruningCriteria = pruningCriteria.filter((c) => c.threadIds.length > 0)

  return { pruningCriteria }
}
