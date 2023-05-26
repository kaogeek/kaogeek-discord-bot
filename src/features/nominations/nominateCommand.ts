import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildMember,
  PermissionsBitField,
  Role,
} from 'discord.js'

import { prisma } from '@/prisma'
import { defineCommand } from '@/types/defineCommand'

export const nominateCommand = defineCommand({
  data: {
    name: 'nominate',
    description: 'Nominates a user for a role',
    defaultMemberPermissions: PermissionsBitField.Flags.SendMessages,
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'user',
        description: 'The user to nominate',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'role',
        description: 'The role to nominate the user for',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason for the nomination',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  disableAutoDeferReply: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return
    if (!interaction.inCachedGuild()) return

    // Get the role from the interaction
    const role = interaction.options.getRole('role')
    if (!role) throw new Error('No role provided')

    // Get the actor from the interaction
    const actor = interaction.member
    if (!actor) throw new Error('No actor found in the interaction')

    // Get the user from the interaction
    const nominatedUser = interaction.options.getUser('user')
    if (!nominatedUser) throw new Error('No user provided')

    // Resolve the member from the user
    const nominatedMember = await interaction.guild.members.fetch(
      nominatedUser.id,
    )

    // Get the reason from the interaction
    const reason =
      interaction.options.getString('reason') ?? 'No reason provided'

    // Ensure that the role is enabled
    const { runtimeConfiguration } = botContext
    const config = runtimeConfiguration.data.nominations.enabledRoles.find(
      (role_) => role_.roleId === role.id,
    )
    if (!config) {
      await interaction.reply({
        content: `The "${role.name}" role is not enabled for nominations.`,
        ephemeral: true,
      })
      return
    }

    // Ensure that the user who sent the command has the target role
    if (!interaction.member?.roles.cache.has(role.id)) {
      await interaction.reply({
        content: `You must have the "${role.name}" role to nominate someone for it.`,
        ephemeral: true,
      })
      return
    }

    // Ensure that the user being nominated does not have the target role
    if (nominatedMember.roles.cache.has(role.id)) {
      await interaction.reply({
        content: `The nominated user already has the "${role.name}" role.`,
        ephemeral: true,
      })
      return
    }

    // Ensure that the actor haven’t already nominated the user
    const existingNomination = await prisma.nomination.findFirst({
      where: {
        userId: actor.id,
        nominatedUserId: nominatedUser.id,
        roleId: role.id,
      },
    })
    if (existingNomination) {
      if (reason === 'cancel') {
        await prisma.nomination.delete({
          where: {
            id: existingNomination.id,
          },
        })
        await interaction.reply({
          content: `You have cancelled your nomination of ${nominatedUser} for the "${role.name}" role.`,
          ephemeral: true,
        })
        await updateNominationMessage(
          nominatedMember,
          role,
          config.nominationsChannelId,
        )
        return
      }
      await interaction.reply({
        content: `You have already nominated ${nominatedUser} for the "${role.name}" role.`,
        ephemeral: true,
      })
      return
    }
    await interaction.deferReply()

    await prisma.nomination.create({
      data: {
        userId: actor.id,
        nominatedUserId: nominatedUser.id,
        reason,
        roleId: role.id,
      },
    })
    await interaction.editReply({
      content:
        `${actor} nominated ${nominatedUser} for the "${role.name}" role.\n` +
        `Reason: ${reason}`,
    })
    await updateNominationMessage(
      nominatedMember,
      role,
      config.nominationsChannelId,
    )
  },
})

async function updateNominationMessage(
  nominatedMember: GuildMember,
  role: Role,
  channelId: string,
) {
  // Delete the existing nomination message
  const existingNominationMessage = await prisma.nominationMessage.findFirst({
    where: {
      nominatedUserId: nominatedMember.id,
      roleId: role.id,
    },
  })
  if (existingNominationMessage) {
    const channel = nominatedMember.guild.channels.cache.get(channelId)
    if (channel?.isTextBased()) {
      const message = await channel.messages.fetch(
        existingNominationMessage.messageId,
      )
      if (message) {
        await message.delete()
      }
    }
    await prisma.nominationMessage.delete({
      where: {
        id: existingNominationMessage.id,
      },
    })
  }

  // Get the nominations for the user
  const nominations = await prisma.nomination.findMany({
    where: {
      nominatedUserId: nominatedMember.id,
      roleId: role.id,
    },
  })
  if (nominations.length === 0) {
    return
  }

  // Generate a new message for the nominations
  const countPeople =
    nominations.length === 1 ? '1 person' : `${nominations.length} people`
  const text: string[] = [
    `${nominatedMember} has been nominated for the "${role.name}" role by ${countPeople}`,
  ]
  for (const nomination of nominations) {
    text.push(`- <@${nomination.userId}>: ${nomination.reason}`)
  }

  // Send the message
  const channel = nominatedMember.guild.channels.cache.get(channelId)
  if (channel?.isTextBased()) {
    const message = await channel.send(text.join('\n'))
    await prisma.nominationMessage.create({
      data: {
        nominatedUserId: nominatedMember.id,
        roleId: role.id,
        messageId: message.id,
      },
    })
  }
}
