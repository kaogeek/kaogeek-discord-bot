import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  DiscordAPIError,
  GuildMember,
  PermissionsBitField,
} from 'discord.js'

import { addUserModerationLogEntry } from '@/features/profileInspector'
import { prisma } from '@/prisma'
import { UserModerationLogEntryType } from '@/types/UserModerationLogEntry'
import { defineCommandHandler } from '@/types/defineCommandHandler'

export default [
  defineCommandHandler({
    data: {
      name: 'Severe mute',
      type: ApplicationCommandType.User,
      defaultMemberPermissions: PermissionsBitField.Flags.MuteMembers,
      dmPermission: false,
    },
    ephemeral: true,
    execute: async (_botContext, interaction) => {
      if (!interaction.guild || !interaction.isContextMenuCommand()) return

      const userId = interaction.targetId
      const member = interaction.guild.members.cache.get(userId)
      if (!member) return

      await severeMute(interaction, member)
    },
  }),
  defineCommandHandler({
    data: {
      name: 'severe-mute',
      description:
        'Server mute a user, and unallow user to be unmute automatically by mute appeal.',
      defaultMemberPermissions: PermissionsBitField.Flags.MuteMembers,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'user',
          description: 'The user to mute',
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    ephemeral: true,
    execute: async (_botContext, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return

      const userId = interaction.options.getUser('user')?.id
      if (!userId) return
      const member = interaction.guild.members.cache.get(userId)
      if (!member) return

      await severeMute(interaction, member)
    },
  }),
]
async function severeMute(
  interaction: CommandInteraction,
  member: GuildMember,
) {
  try {
    //muting might fail if the target is in higher role hierachy.
    await member.voice.setMute(true, 'Severe mute from breaking server rules.') // imply that severe mute will be use only when user break server rule.
    await prisma.userProfile.upsert({
      where: { id: member.user.id },
      update: { severeMuted: true },
      create: {
        id: member.user.id,
        tag: member.user.tag,
        displayName: member.displayName,
        severeMuted: true,
      },
    }) // severeMuted bool will be use when mute appeal
    await addUserModerationLogEntry(
      member.user.id,
      interaction.user.id,
      UserModerationLogEntryType.Mute,
      `Apply severe mute punishment to ${member.user.tag}.`,
    )
    await interaction.editReply(`${member.user} is severely muted.`)
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === 40_032) {
      await interaction.editReply(
        `${member.user} is not in voice channel, so muting fail.`,
      )
    }
    if (error instanceof DiscordAPIError && error.code === 50_013) {
      await interaction.editReply(
        `${member.user} is in higher role hierachy than you, so muting fail.`,
      )
    }
  }
}
