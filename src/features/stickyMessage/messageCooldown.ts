import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { Environment } from '../../config.js'

import { pushMessageToBottom } from './index.js'
import { ChannelLockType, lockChannel, unlockChannel } from './lockChannel.js'

interface IChannelCooldownContainer {
  [channelId: string]: NodeJS.Timeout
}

const channelCooldown: IChannelCooldownContainer = {}

/**
 * Start the cooldown for the specified channel.
 *
 * @param {string} channelId - The ID of the channel to start the cooldown.
 * @returns {Promise<void>} A Promise that resolves once the cooldown is set.
 */
export async function startCooldown(channelId: string): Promise<void> {
  lockChannel(channelId, ChannelLockType.COOLDOWN)

  const cooldown = channelCooldown[channelId]

  if (cooldown) {
    clearTimeout(cooldown)
  }

  const timeoutId = setTimeout(() => {
    unlockChannel(channelId, ChannelLockType.COOLDOWN)
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown[channelId] = timeoutId
}

/**
 * Set the cooldown of the channel.
 * @param {Message} message - The message object associated with the channel.
 * @param {StickyMessage} stickyMessage - The sticky message associated with the channel.
 * @returns {Promise<void>} A Promise that resolves once the cooldown is set.
 */

export async function resetCooldown(
  message: Message,
  stickyMessage: StickyMessage,
): Promise<void> {
  lockChannel(message.channelId, ChannelLockType.COOLDOWN)

  const cooldown = channelCooldown[message.channelId]

  if (cooldown) {
    clearTimeout(cooldown)
  }

  const timeoutId = setTimeout(() => {
    unlockChannel(message.channelId, ChannelLockType.COOLDOWN)
    pushMessageToBottom(message, stickyMessage)
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown[message.channelId] = timeoutId
}
