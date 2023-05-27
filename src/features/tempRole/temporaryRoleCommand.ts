import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildMember,
  PermissionsBitField,
  Role,
  time,
} from 'discord.js'

import parse from 'humanize-ms'

import { prisma } from '@/prisma'
import { defineCommand } from '@/types/defineCommand'

export const temporaryRoleCommand = defineCommand({
  data: {
    name: 'temp-role',
    description: 'Set a temporary role for a user',
    defaultMemberPermissions: PermissionsBitField.Flags.ManageRoles,
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'user',
        description: 'User to set the temporary role for',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'role',
        description: 'Role to set',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'duration',
        description: 'Duration of the temporary role e.g. 1d',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return

    // Get user from the interaction
    const user = interaction.options.getMember('user') as GuildMember

    // Get role from the interaction
    const role = interaction.options.getRole('role') as Role

    // Get duration from the interaction
    const duration = interaction.options.getString('duration') as string

    // Parse the duration
    const durationMs = parse(duration)

    // Check if the duration is invalid
    if (!durationMs) {
      await interaction.editReply({
        content: `Invalid duration: ${duration}`,
      })
      return
    }

    // Check if the user already has the role
    if (user.roles.cache.has(role.id)) {
      await interaction.editReply({
        content: `User: ${user} already has role: ${role}`,
      })
      return
    }

    const expiresAt = new Date(Date.now() + durationMs)

    try {
      // Add the role to the user
      await user.roles.add(role)

      // Add the temporary role to the database
      await prisma.tempRole.create({
        data: {
          guildId: interaction.guild.id,
          userId: user.id,
          roleId: role.id,
          expiresAt: expiresAt,
        },
      })

      // Reply to the interaction
      await interaction.editReply({
        content: `User: ${user} got role: ${role} for duration: ${duration} (expires at: ${time(
          expiresAt,
        )})`,
      })
    } catch (error) {
      console.error(
        `Failed to add role "${role.name}" to "${user.user.tag}"`,
        (error as Error).message,
      )
      await interaction.editReply({
        content: `Failed to add role: ${role} to user: ${user}`,
      })
    }
  },
})
