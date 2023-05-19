import {
  APIEmbed,
  ButtonStyle,
  Client,
  CommandInteraction,
  ComponentType,
  GuildMember,
} from 'discord.js'
import { InteractionButtonComponentData } from 'discord.js'
import { TextInputStyle } from 'discord.js'

import { UserModerationLog } from '@prisma/client'
import { randomUUID } from 'crypto'

import { prisma } from '../../prisma.js'

export async function inspectProfile(
  client: Client,
  interaction: CommandInteraction,
  member: GuildMember,
): Promise<void> {
  const logs = await prisma.userModerationLog.findMany({
    where: { userId: member.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  const userProfile = await ensureUserProfile(member)

  const description =
    logs.length > 0
      ? logs.map(formatLog).join('\n')
      : '(No moderation logs found)'

  const embeds: APIEmbed[] = [
    {
      title: `${userProfile.tag} (${userProfile.displayName})`,
      description,
      color: 0xff7700,
      fields: [
        { name: 'ID', value: userProfile.id, inline: true },
        { name: 'Strikes', value: `${userProfile.strikes}`, inline: true },
      ],
    },
  ]

  const strikeActionId = randomUUID() as string
  const resetStrikeActionId = randomUUID() as string
  const buttons: InteractionButtonComponentData[] = []
  buttons.push({
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    label: 'Strike',
    customId: strikeActionId,
  })
  if (userProfile.strikes > 0) {
    buttons.push({
      type: ComponentType.Button,
      style: ButtonStyle.Primary,
      label: 'Reset strike',
      customId: resetStrikeActionId,
    })
  }
  await interaction.editReply({
    embeds,
    components: [
      {
        type: ComponentType.ActionRow,
        components: buttons,
      },
    ],
  })

  const selectedInteraction = await Promise.resolve(
    interaction.channel?.awaitMessageComponent({
      filter: (i) => buttons.map((b) => b.customId).includes(i.customId),
      time: 60000,
    }),
  ).catch(() => null)

  if (!selectedInteraction) {
    await interaction.editReply({ components: [] })
    return
  }

  const logActivity = (
    type: string,
    message: string,
    metadata: object = {},
  ) => {
    return prisma.userModerationLog.create({
      data: {
        userId: userProfile.id,
        actorId: interaction.user.id,
        type,
        message,
        metadata: JSON.stringify(metadata),
      },
    })
  }

  if (selectedInteraction.customId === strikeActionId) {
    const strikes = userProfile.strikes + 1
    const promptId = randomUUID() as string
    await selectedInteraction.showModal({
      customId: promptId,
      title: `Strike #${strikes}`,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              customId: 'reason',
              label: 'Reason',
              type: ComponentType.TextInput,
              style: TextInputStyle.Short,
              required: true,
              placeholder: '…',
            },
          ],
        },
      ],
    })
    const submitted = await selectedInteraction
      .awaitModalSubmit({
        time: 5 * 60000,
        filter: (i) => i.customId === promptId,
      })
      .catch(() => null)
    if (!submitted) {
      await selectedInteraction.reply({
        content: 'Timed out',
        ephemeral: true,
      })
      return inspectProfile(client, interaction, member)
    }

    const reason = submitted.fields.getTextInputValue('reason')
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { strikes },
    })
    await logActivity(
      'strike',
      `strike #${strikes} added by ${interaction.user.tag}: ${reason}`,
      { strikes },
    )

    await submitted.reply({
      content: `strike #${strikes} added to ${userProfile.tag}`,
      ephemeral: true,
    })
    return inspectProfile(client, interaction, member)
  }

  if (selectedInteraction.customId === resetStrikeActionId) {
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { strikes: 0 },
    })
    await logActivity(
      'strike',
      `strikes reset to 0 by ${interaction.user.tag}`,
      { strikes: 0 },
    )
    await selectedInteraction.reply({
      content: `strikes reset for ${userProfile.tag}`,
      ephemeral: true,
    })
    return inspectProfile(client, interaction, member)
  }
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
