import {
  CacheType,
  ChatInputCommandInteraction,
  DiscordAPIError,
  GuildMember,
} from 'discord.js'

import { Environment } from '@/config'
import { addUserModerationLogEntry } from '@/features/profileInspector'
import { prisma } from '@/prisma'
import { UserModerationLogEntryType } from '@/types/UserModerationLogEntry'
import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
  data: {
    name: 'appeal-for-server-mute',
    description:
      'Appeal for microphone muted. Use when server muted only, else you will be timed out for one minute.',
  },
  ephemeral: true,
  execute: async (_botContext, interaction) => {
    if (
      !interaction.isChatInputCommand() ||
      interaction.channelId !== Environment.MIC_MUTE_APPEAL_CHANNEL_ID
    ) {
      interaction.deleteReply()
      return
    }
    if (interaction.member instanceof GuildMember) {
      //when start the bot, all user voice state might be null.This if statement is to prevent it.
      if (interaction.member.voice.serverMute === null) {
        interaction.editReply('Please join voice channel')
        return
      }
      //prevent spamming appeal when the user is not mute
      if (interaction.member.voice.serverMute === false) {
        await interaction.editReply(
          'You are not muted, you will be timed out for one minute due to the false mute appeal.',
        )
        try {
          //time out does not work on user with higher role hierachy.
          await interaction.member.timeout(1000 * 60)
        } catch (error) {
          if (error instanceof DiscordAPIError && error.code === 50_013) {
            console.error(`error`, error.message)
          }
        }
        return
      }
      //if the user is mute, unmute the user.
      //unmuting might be depended on reason why user is server muted.
      else {
        try {
          if (await isMutedForSeverePunishment(interaction)) {
            interaction.editReply(
              `You were severe muted. Please, appeal to a moderator directly for severe mute pardon.`,
            )
          } else {
            await interaction.member.voice.setMute(false)
            await interaction.editReply(`Unmute ${interaction.member.user}`)
            await addUserModerationLogEntry(
              interaction.user.id,
              interaction.user.id,
              UserModerationLogEntryType.Mute,
              `Unmute ${interaction.member.user.tag} by auto mute appeal`,
            )
          }
        } catch (error) {
          if (error instanceof DiscordAPIError && error.code === 40_032) {
            interaction.editReply(
              `${interaction.member.user}, please connect to voice channel, so we can unmute you.`,
            )
          }
        }
      }
    }
  },
})

async function isMutedForSeverePunishment(
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<boolean> {
  const profile = await prisma.userProfile.findFirst({
    where: { id: interaction.user.id },
  }) //retreive the latest mute record of user
  //null mean no profile have been registered into DB, so user have not been punished with severe mute.
  return profile ? profile.severeMuted : false
}
