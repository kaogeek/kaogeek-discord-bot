import { prisma } from '../../prisma.js'
import { saveCache } from '../../utils/cache.js'

/**
 *
 *  Init sticky message memory cache
 *
 */
export async function initStickyMessageCache() {
  const messages = await prisma.stickyMessage.findMany()
  for (const message of messages) {
    saveCache(message.channelId, message)
  }
}
