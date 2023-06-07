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
        name: 'add',
        description: 'Add a temporary role to a user',
        type: ApplicationCommandOptionType.Subcommand,
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
      {
        name: 'remove',
        description: 'Remove a temporary role from a user',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'User to remove the temporary role from',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'role',
            description: 'Role to remove',
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
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

    if (interaction.options.getSubcommand() === 'add') {
      temporaryRoleAdd()
    } else if (interaction.options.getSubcommand() === 'remove') {
      temporaryRoleRemove()
    }

    async function temporaryRoleAdd() {
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
        try {
          await prisma.tempRole.create({
            data: {
              guildId: interaction.guildId as string,
              userId: user.id,
              roleId: role.id,
              expiresAt: expiresAt,
            },
          })
        } catch (error) {
          console.error(
            `Failed to add temp role to database`,
            (error as Error).message,
          )
        }

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
    }

    async function temporaryRoleRemove() {
      // Check if the user not has the role
      if (!user.roles.cache.has(role.id)) {
        await interaction.editReply({
          content: `User: ${user} does not have role: ${role}`,
        })
        return
      }

      try {
        // Remove the role from the user
        await user.roles.remove(role)

        // Remove the temporary role from the database
        try {
          await prisma.tempRole.deleteMany({
            where: {
              guildId: interaction.guildId as string,
              userId: user.id,
              roleId: role.id,
            },
          })
        } catch (error) {
          console.error(
            `Failed to remove temp role from database`,
            (error as Error).message,
          )
        }

        // Reply to the interaction
        await interaction.editReply({
          content: `User: ${user} lost role: ${role}`,
        })
      } catch {
        console.error(
          `Failed to remove role "${role.name}" from "${user.user.tag}"`,
        )
        await interaction.editReply({
          content: `Failed to remove role: ${role} from user: ${user}`,
        })
      }
    }
  },
})
