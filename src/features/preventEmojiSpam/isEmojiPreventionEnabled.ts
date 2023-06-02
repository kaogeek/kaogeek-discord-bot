import { Channel } from 'discord.js'

import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

export function isEmojiPreventionEnabled(
  config: RuntimeConfigurationSchema['preventEmojiSpam'],
  channel: Pick<Channel, 'id'>,
) {
  if (config.disabledChannels.includes(channel.id)) {
    return false
  }

  if (config.enabledChannels.includes(channel.id)) {
    return true
  }

  return config.enabled
}
