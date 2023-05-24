const messageInChannelCounter: Map<string, number> = new Map()

/**
 * Increase counter of the message that was sent in the channel
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function incCounter(channelId: string): void {
  let count = messageInChannelCounter.get(channelId) || 0
  messageInChannelCounter.set(channelId, ++count)
}

/**
 * Reset the counter
 *
 * @param {string} channelId - the id of channel of counter that want to reset
 *
 */
export function resetCounter(channelId: string): void {
  messageInChannelCounter.set(channelId, 1)
}

/**
 * Get current message count
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function getCounter(channelId: string): number {
  return messageInChannelCounter.get(channelId) || 1
}
