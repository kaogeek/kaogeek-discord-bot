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

  if (checkZalgo(member.displayName) && enabledCheckZalgo) {
    member
      .setNickname(clean(member.displayName), 'Zalgo Name Detacted')
      .catch(() => {
        log.info(`Can't change ${member.displayName}'s name`)
      })
  }

  if (checkDehoisted(member.displayName) && enabledCheckDehoisted) {
    member
      .setNickname(member.user.username, 'Dehoisted Name Detacted')
      .catch(() => {
        log.info(`Can't change ${member.displayName}'s name`)
      })
  }

  if (checkExclamationMark(member.displayName) && enabledCheckExclamationMark) {
    member
      .setNickname(member.user.username, 'Exclamation Mark Name Detacted')
      .catch(() => {
        log.info(`Can't change ${member.displayName}'s name`)
      })
  }

  if (
    checkNameAgainstPatterns(member.displayName, patterns, log) &&
    enabledCheckBadName
  ) {
    member.setNickname(member.user.username, 'Bad Name Detacted').catch(() => {
      log.info(`Can't change ${member.displayName}'s name`)
    })
  }
}
