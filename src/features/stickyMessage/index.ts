import { prisma } from '../../prisma.js'
import { saveCache } from '../../utils/cache.js'

import { resetCounter } from './messageCooldown.js'

/**
 *
 *  Init sticky message memory cache
 *
 */
export async function initStickyMessage() {
  const messages = await prisma.stickyMessage.findMany()
  for (const message of messages) {
    saveCache(`sticky-${message.channelId}`, message)
    resetCounter(message.channelId)
  }
}
