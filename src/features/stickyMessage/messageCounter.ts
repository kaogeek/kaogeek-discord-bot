interface IChannelCounterContainer {
  [channelId: string]: number
}

const messageInChannelCounter: IChannelCounterContainer = {}

/**
 * Increase counter of the message that was sent in the channel
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function incCounter(channelId: string): void {
  if (!++messageInChannelCounter[channelId]) {
    messageInChannelCounter[channelId] = 1
  }
}

/**
 * Reset the counter
 *
 * @param {string} channelId - the id of channel of counter that want to reset
 *
 */
export function resetCounter(channelId: string): void {
  messageInChannelCounter[channelId] = 1
}

/**
 * Get current message count
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function getCounter(channelId: string): number {
  return messageInChannelCounter[channelId]
}
