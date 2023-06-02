import { Channel } from 'discord.js'

import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

export function isEmojiPreventionEnabled(
  config: RuntimeConfigurationSchema['preventEmojiSpam'],
  channel: Pick<Channel, 'id'>,
  member: { roles: { cache: { has: (roleId: string) => boolean } } },
) {
  if (config.disabledChannels.includes(channel.id)) {
    return false
  }

  if (config.enabledChannels.includes(channel.id)) {
    return true
  }

  if (config.bypassRoles.some((roleId) => member.roles.cache.has(roleId))) {
    return false
  }

  return config.enabled
}
