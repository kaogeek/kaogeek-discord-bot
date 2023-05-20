import { APIThreadChannel, SnowflakeUtil } from 'discord.js'

export interface PruningCriteria {
  name: string
  threadIds: string[]
}

export function getThreadStats(threads: APIThreadChannel[]) {
  threads = Array.from(threads).sort(
    (a, b) => +(b.last_message_id ?? 0) - +(a.last_message_id ?? 0),
  )

  // const createPruningCriteria = (
  //   name: string,
  //   filter: (thread: APIThreadChannel, index: number) => boolean,
  // ) => {
  //   return {
  //     name,
  //     threadIds: threads.filter(filter).map((t) => t.id),
  //   }
  // }
  // const olderThan = (ms: number) => (thread: APIThreadChannel) => {
  //   const timestamp = thread.last_message_id
  //     ? SnowflakeUtil.timestampFrom(thread.last_message_id)
  //     : Infinity
  //   return Date.now() - timestamp > ms
  // }
  // const bottom = (count: number) => (_: APIThreadChannel, index: number) =>
  //   index >= threads.length - count
  // return {
  //   pruningCriteria: [
  //     createPruningCriteria('older than 1 hour', olderThan(3600e3 * 1)),
  //     createPruningCriteria('older than 3 hours', olderThan(3600e3 * 3)),
  //     createPruningCriteria('older than 6 hours', olderThan(3600e3 * 6)),
  //     createPruningCriteria('older than 24 hours', olderThan(3600e3 * 24)),
  //     createPruningCriteria('older than 48 hours', olderThan(3600e3 * 48)),
  //     createPruningCriteria('older than 72 hours', olderThan(3600e3 * 72)),
  //     createPruningCriteria('bottom 100', bottom(100)),
  //   ],
  // }

  let pruningCriteria: PruningCriteria[] = []
  for (const h of [1, 3, 6, 24, 48, 72]) {
    const name = `Prune threads with last message older than ${h}h`
    const threadIds = threads
      .filter((thread) => {
        const timestamp = thread.last_message_id
          ? SnowflakeUtil.timestampFrom(thread.last_message_id)
          : Infinity
        return Date.now() - timestamp > 3600e3 * h
      })
      .map((t) => t.id)
    pruningCriteria.push({ name, threadIds })
  }
  for (const n of [100]) {
    const name = `Prune bottom ${n} threads`
    const threadIds = threads
      .filter((_, index) => index >= threads.length - n)
      .map((t) => t.id)
    pruningCriteria.push({ name, threadIds })
  }
  pruningCriteria = pruningCriteria.filter((c) => c.threadIds.length > 0)
  return { pruningCriteria }
}
