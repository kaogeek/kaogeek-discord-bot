import { GuildMember } from 'discord.js'

import { clean } from 'unzalgo'

import { Environment } from '@/config'
import { BotContext } from '@/types/BotContext'
import { Logger } from '@/types/Logger'

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

  const reasonMessage: string[] = []

  if (checkZalgo(member.nickname) && enabledCheckZalgo) {
    reasonMessage.push('Zalgo')
  }

  if (checkDehoisted(member.nickname) && enabledCheckDehoisted) {
    reasonMessage.push('Dehoisted')
  }

  if (checkExclamationMark(member.nickname) && enabledCheckExclamationMark) {
    reasonMessage.push('Exclamation Mark')
  }

  if (
    checkNameAgainstPatterns(clean(member.nickname.trim()), patterns, log) &&
    enabledCheckBadName
  ) {
    reasonMessage.push('Bad Name')
  }

  console.log(reasonMessage)
  // only Zalgo to clean name else other reason reset name
  if (reasonMessage.length === 1 && reasonMessage[0] === 'Zalgo') {
    await setNickname(
      member,
      log,
      clean(member.nickname),
      reasonMessage.join(' Name Detected'),
    )
  } else if (reasonMessage.length > 0) {
    await setNickname(
      member,
      log,
      null,
      reasonMessage.join(' and ') + ' Name Detected',
    )
  }
}

async function setNickname(
  member: GuildMember,
  log: Logger,
  name: string | null,
  reason: string,
) {
  const messageChangeNameError = `Can't change ${member.nickname}'s name (${member.id})`
  await member.setNickname(name, reason).catch((error) => {
    log.error(messageChangeNameError, error)
  })
}
