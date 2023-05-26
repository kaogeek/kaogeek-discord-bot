import {
  APIEmbed,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  GuildMember,
  InteractionButtonComponentData,
  Message,
  MessageComponentInteraction,
  PermissionsBitField,
} from 'discord.js'

import { UserModerationLog, UserProfile } from '@prisma/client'

import { prisma } from '@/prisma'
import { BotContext } from '@/types/BotContext'
import { UserModerationLogEntryType } from '@/types/UserModerationLogEntry'
import { defineCommand } from '@/types/defineCommand'
import { definePlugin } from '@/types/definePlugin'
import { ActionSet } from '@/utils/ActionSet'
import { prompt } from '@/utils/prompt'

export default definePlugin({
  name: 'profileInspector',
  setup: (pluginContext) => {
    pluginContext.addCommand(inspectProfileUserCommand)
    pluginContext.addCommand(inspectAuthorMessageCommand)
    pluginContext.addCommand(inspectUserSlashCommand)
  },
})

const inspectProfileUserCommand = defineCommand({
  data: {
    name: 'Inspect profile',
    type: ApplicationCommandType.User,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
    dmPermission: false,
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    const userId = interaction.targetId
    const member = interaction.guild.members.cache.get(userId)
    if (!member) return

    await inspectProfile(botContext, { interaction, member })
  },
})

const inspectAuthorMessageCommand = defineCommand({
  data: {
    name: 'Inspect author',
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
    dmPermission: false,
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    const messageId = interaction.targetId
    const message = await interaction.channel?.messages.fetch(messageId)
    if (!message) return

    const userId = message.author.id
    const member = interaction.guild.members.cache.get(userId)
    if (!member) return

    await inspectProfile(botContext, {
      interaction,
      member,
      messageContext: message,
    })
  },
})

const inspectUserSlashCommand = defineCommand({
  data: {
    name: 'inspect-user',
    description: 'Inspect a user profile',
    defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'user',
        description: 'The user to inspect',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return

    const userId = interaction.options.getUser('user')?.id
    if (!userId) return
    const member = interaction.guild.members.cache.get(userId)
    if (!member) return

    await inspectProfile(botContext, { interaction, member })
  },
})

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
    UserModerationLogEntryType.Strike,
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
    UserModerationLogEntryType.Strike,
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
  type: UserModerationLogEntryType,
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
  type: UserModerationLogEntryType,
  message: string,
  metadataObject: object = {},
) => {
  const metadata = JSON.stringify(metadataObject)
  return prisma.userModerationLog.create({
    data: { userId, actorId, type, message, metadata },
  })
}
