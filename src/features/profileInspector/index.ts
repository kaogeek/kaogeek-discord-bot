import {
  APIEmbed,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  GuildMember,
  Message,
} from 'discord.js'
import { InteractionButtonComponentData } from 'discord.js'
import { MessageComponentInteraction } from 'discord.js'

import { prisma } from '@/prisma'
import { BotContext } from '@/types/BotContext'
import { ActionSet } from '@/utils/ActionSet'
import { prompt } from '@/utils/prompt'
import { UserModerationLog, UserProfile } from '@prisma/client'

export interface InspectProfileOptions {
  interaction: CommandInteraction
  member: GuildMember
  messageContext?: Message
}

interface InspectProfileContext {
  botContext: BotContext
  options: InspectProfileOptions
}

export async function inspectProfile(
  botContext: BotContext,
  options: InspectProfileOptions,
): Promise<void> {
  return inspectProfileMain({ botContext, options })
}

async function inspectProfileMain(
  context: InspectProfileContext,
): Promise<void> {
  const { interaction, member } = context.options
  const logs = await prisma.userModerationLog.findMany({
    where: { userId: member.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  const userProfile = await ensureUserProfile(member)

  const description =
    logs.length > 0
      ? logs.map((element) => formatLog(element)).join('\n')
      : '(No moderation logs found)'

  const embeds: APIEmbed[] = [
    {
      title: `${userProfile.tag} (${userProfile.displayName})`,
      description,
      color: 0xff_77_00,
      fields: [
        { name: 'ID', value: userProfile.id, inline: true },
        { name: 'Strikes', value: `${userProfile.strikes}`, inline: true },
      ],
    },
  ]

  const logContext: LogContext = {
    userId: userProfile.id,
    actorId: interaction.user.id,
  }
  const actions = new ActionSet()
  const buttons: InteractionButtonComponentData[] = []
  buttons.push({
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    label: 'Strike',
    customId: actions.register('strike', (buttonInteraction) =>
      strike(context, userProfile, logContext, buttonInteraction),
    ),
  })
  if (userProfile.strikes > 0) {
    buttons.push({
      type: ComponentType.Button,
      style: ButtonStyle.Primary,
      label: 'Reset strike',
      customId: actions.register('resetStrike', (buttonInteraction) =>
        resetStrike(context, userProfile, logContext, buttonInteraction),
      ),
    })
  }
  await interaction.editReply({
    embeds,
    components: [{ type: ComponentType.ActionRow, components: buttons }],
  })
  const result = await actions.awaitInChannel(interaction.channel, 60_000)
  await interaction.editReply({ components: [] })

  if (!result) return
  return result.registeredAction.handler(result.interaction)
}

async function strike(
  context: InspectProfileContext,
  userProfile: UserProfile,
  logContext: LogContext,
  buttonInteraction: MessageComponentInteraction,
) {
  const strikes = userProfile.strikes + 1
  const submission = await prompt(
    buttonInteraction,
    `Strike #${strikes}`,
    'Reason',
  )
  if (!submission) {
    await buttonInteraction.reply({
      content: 'Timed out',
      ephemeral: true,
    })
    return inspectProfileMain(context)
  }

  const reason = submission.text
  await prisma.userProfile.update({
    where: { id: userProfile.id },
    data: { strikes },
  })

  const { messageContext, interaction } = context.options
  const suffix = messageContext ? ` (context: ${messageContext.url})` : ''
  await logActivity(
    logContext,
    'strike',
    `strike #${strikes} added by ${interaction.user.tag}: ${reason}${suffix}`,
    { strikes, message: messageContext?.url },
  )

  await submission.interaction.reply({
    content: `strike #${strikes} added to ${userProfile.tag}`,
    ephemeral: true,
  })
  return inspectProfileMain(context)
}

async function resetStrike(
  context: InspectProfileContext,
  userProfile: UserProfile,
  logContext: LogContext,
  buttonInteraction: MessageComponentInteraction,
) {
  await prisma.userProfile.update({
    where: { id: userProfile.id },
    data: { strikes: 0 },
  })
  const { interaction, messageContext } = context.options
  const suffix = messageContext ? ` (context: ${messageContext.url})` : ''
  await logActivity(
    logContext,
    'strike',
    `strikes reset to 0 by ${interaction.user.tag}${suffix}`,
    { strikes: 0 },
  )
  await buttonInteraction.reply({
    content: `strikes reset for ${userProfile.tag}`,
    ephemeral: true,
  })
  return inspectProfileMain(context)
}

const formatLog = (log: UserModerationLog) =>
  `${formatDiscordTimestamp(log.createdAt)} ${log.type} - ${log.message}`

const formatDiscordTimestamp = (date: Date) =>
  `<t:${Math.floor(date.getTime() / 1000)}:R>`

async function ensureUserProfile(member: GuildMember) {
  const id = member.user.id
  const tag = member.user.tag
  const displayName = member.displayName
  const userProfile = await prisma.userProfile.upsert({
    where: { id: id },
    update: { tag, displayName },
    create: { id, tag, displayName },
  })
  return userProfile
}

export function addUserModerationLogEntry(
  userId: string,
  actorId: string,
  type: string,
  message: string,
  metadata: object = {},
) {
  return prisma.userModerationLog.create({
    data: {
      userId,
      actorId,
      type,
      message,
      metadata: JSON.stringify(metadata),
    },
  })
}

interface LogContext {
  userId: string
  actorId: string
}

const logActivity = (
  { userId, actorId }: LogContext,
  type: string,
  message: string,
  metadataObject: object = {},
) => {
  const metadata = JSON.stringify(metadataObject)
  return prisma.userModerationLog.create({
    data: { userId, actorId, type, message, metadata },
  })
}
