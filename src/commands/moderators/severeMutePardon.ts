import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
} from 'discord.js'

import { Environment } from '../../config.js'
import { addUserModerationLogEntry } from '../../features/profileInspector/index.js'
import { prisma } from '../../prisma.js'
import { UserModerationLogEntryType } from '../../types/UserModerationLogType.js'
import { defineCommandHandler } from '../../types/defineCommandHandler.js'

export default [
  defineCommandHandler({
    //please used this command on apology message of punished member, if you deem that they regret their wrong doing.
    data: {
      name: 'Severe mute pardon',
      type: ApplicationCommandType.Message,
      defaultMemberPermissions: PermissionsBitField.Flags.MuteMembers,
      dmPermission: false,
    },
    ephemeral: true,
    execute: async (_botContext, interaction) => {
      if (
        !interaction.guild ||
        !interaction.isContextMenuCommand() ||
        interaction.channelId !== Environment.MIC_MUTE_APPEAL_CHANNEL_ID
      )
        return

      const messageId = interaction.targetId
      const message = await interaction.channel?.messages.fetch(messageId)
      if (!message) return

      const userId = message.author.id
      const member = interaction.guild.members.cache.get(userId)
      console.log(member)
      if (!member) return

      await severeMutePardon(interaction, member)
    },
  }),
  defineCommandHandler({
    data: {
      name: 'severe-mute-pardon',
      description: `Pardon severe mute punishment, this command should not be used unless for wrong punishment.`,
      type: ApplicationCommandType.ChatInput,
      defaultMemberPermissions: PermissionsBitField.Flags.MuteMembers,
      options: [
        {
          name: 'user',
          description: 'The user to pardon',
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    ephemeral: true,
    execute: async (_botContext, interaction) => {
      if (
        !interaction.guild ||
        !interaction.isChatInputCommand() ||
        interaction.channelId !== Environment.MIC_MUTE_APPEAL_CHANNEL_ID
      )
        return

      const userId = interaction.options.getUser('user')?.id
      if (!userId) return
      const member = interaction.guild.members.cache.get(userId)
      if (!member) return

      await severeMutePardon(interaction, member)
    },
  }),
]

async function severeMutePardon(
  interaction: CommandInteraction,
  member: GuildMember,
) {
  try {
    //unmuting might fail if the target is in higher role hierachy.
    await member.voice.setMute(false, 'Pardon severe mute')
    await prisma.userProfile.update({
      where: { id: member.user.id },
      data: { severeMuted: false },
    })
    await addUserModerationLogEntry(
      member.user.id,
      interaction.user.id,
      UserModerationLogEntryType.Mute,
      `Pardon severe mute punishment to ${member.user.tag}.`,
    )
    await interaction.editReply(
      `${member.user} is pardon for severe mute punishment.`,
    )
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('Target user is not connected to voice')
    ) {
      await interaction.editReply(
        `${member.user} is not in voice channel, so pardon fail.`,
      )
    }
    if (err instanceof Error && err.message.includes('Missing Permissions')) {
      await interaction.editReply(
        `${member.user} is in higher role hierachy than you, so pardon fail.`,
      )
    }
  }
}
