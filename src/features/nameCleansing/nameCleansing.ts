import { GuildMember } from 'discord.js'

import { clean } from 'unzalgo'

import { Environment } from '@/config'
import { BotContext } from '@/types/BotContext'

import {
  checkDehoisted,
  checkExclamationMark,
  checkNameAgainstPatterns,
  checkZalgo,
} from './checkName'

export const compiled = new Map<string, RegExp>()

export async function checkName(member: GuildMember, botContext: BotContext) {
  const { log, runtimeConfiguration } = botContext
  const config = runtimeConfiguration.data.nameCleansing
  const configNameList = runtimeConfiguration.data.nameChecker
  if (member.guild.id !== Environment.GUILD_ID) return

  const {
    enabled,
    enabledCheckZalgo,
    enabledCheckDehoisted,
    enabledCheckExclamationMark,
    enabledCheckBadName,
  } = config
  if (!enabled) {
    return
  }

  const { patterns } = configNameList
  if (!patterns) {
    return
  }

  if (member.nickname === null) {
    return
  }

  if (checkZalgo(member.nickname) && enabledCheckZalgo) {
    member
      .setNickname(clean(member.nickname), 'Zalgo Name Detacted')
      .catch((error) => {
        log.error(
          `Can't change ${member.nickname}'s name (${member.id})`,
          error,
        )
      })
  }

  if (checkDehoisted(member.nickname) && enabledCheckDehoisted) {
    member.setNickname(null, 'Dehoisted Name Detacted').catch((error) => {
      log.error(`Can't change ${member.nickname}'s name (${member.id})`, error)
    })
  }

  if (checkExclamationMark(member.nickname) && enabledCheckExclamationMark) {
    member
      .setNickname(null, 'Exclamation Mark Name Detacted')
      .catch((error) => {
        log.error(
          `Can't change ${member.nickname}'s name (${member.id})`,
          error,
        )
      })
  }

  if (
    checkNameAgainstPatterns(member.nickname, patterns, log) &&
    enabledCheckBadName
  ) {
    member.setNickname(null, 'Bad Name Detacted').catch((error) => {
      log.error(`Can't change ${member.nickname}'s name (${member.id})`, error)
    })
  }
}
