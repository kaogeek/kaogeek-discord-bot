import { GuildMember } from 'discord.js'

import { Environment } from '@/config'
import { BotContext } from '@/types/BotContext'

import { checkNameAgainstPatterns } from './checkNameAgainstPatterns'

export const compiled = new Map<string, RegExp>()
const seen = new Map<string, number>()

export async function checkName(member: GuildMember, botContext: BotContext) {
  const { log, runtimeConfiguration } = botContext
  const config = runtimeConfiguration.data.nameChecker
  if (member.guild.id !== Environment.GUILD_ID) return

  const { reportChannelId, patterns } = config
  if (!patterns) {
    return
  }

  const reportChannel = member.guild.channels.cache.get(reportChannelId)
  if (!reportChannel) {
    log.error('Unable to check name because report channel is missing')
    return
  }
  if (!reportChannel.isTextBased()) {
    log.error('Unable to check name because report channel is not text based')
    return
  }

  const checkResult = checkNameAgainstPatterns(
    member.displayName,
    patterns,
    log,
  )
  if (checkResult) {
    const isNew = !seen.has(member.id)
    seen.set(member.id, Date.now())
    if (isNew) {
      log.info(
        `Name pattern match ${checkResult}: "${member.displayName}" (${member.id})`,
      )
      await reportChannel?.send(`Name pattern match: ${member}`)
    }
  }
}
