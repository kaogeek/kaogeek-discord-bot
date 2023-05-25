import { GuildMember } from 'discord.js'

import { Environment } from '@/config'
import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

import { checkNameAgainstPatterns } from './checkNameAgainstPatterns'

export const compiled = new Map<string, RegExp>()
const seen = new Map<string, number>()
type Config = RuntimeConfigurationSchema['nameChecker']

export async function checkName(member: GuildMember, config: Config) {
  if (member.guild.id !== Environment.GUILD_ID) return

  const { reportChannelId, patterns } = config
  if (!patterns) {
    return
  }

  const reportChannel = member.guild.channels.cache.get(reportChannelId)
  if (!reportChannel) {
    console.error('Unable to check name because report channel is missing')
    return
  }
  if (!reportChannel.isTextBased()) {
    console.error(
      'Unable to check name because report channel is not text based',
    )
    return
  }

  const checkResult = checkNameAgainstPatterns(member.displayName, patterns)
  if (checkResult) {
    const isNew = !seen.has(member.id)
    seen.set(member.id, Date.now())
    if (isNew) {
      await reportChannel?.send(`Name pattern match: ${member}`)
    }
  }
}
