import { CacheType, ChatInputCommandInteraction, GuildMember } from 'discord.js'

import { Environment } from '../../config.js'
import { addUserModerationLogEntry } from '../../features/profileInspector/index.js'
import { UserModerationLogEntryType } from '../../types/UserModerationLogType.js'
import { defineCommandHandler } from '../../types/defineCommandHandler.js'

export default defineCommandHandler({
  data: {
    name: 'appeal-for-server-mute',
    description:
      'Appeal for microphone muted. Use when server muted only, else you will be timed out for one minute.',
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
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
        } catch (err) {
          console.log(err)
        }
        return
      }
      //if the user is mute, unmute the user.
      //unmuting might be depended on reason why user is server muted.
      else {
        try {
          if (isMutedForSeverePunishment(interaction)) {
            //this if condition may vary to fit the reason why the user was banned.
            await interaction.member.voice.setMute(false)
            await interaction.editReply(`Unmute ${interaction.member.user}`)
            await addUserModerationLogEntry(
              interaction.user.id,
              interaction.user.id,
              UserModerationLogEntryType.Mute,
              `Unmute ${interaction.member.user.tag} by auto mute appeal`,
            )
          } else {
            //this scope is for future development when user server mute is for severe punishment like spamming or racial slur.
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes('Target user is not connected to voice')
          ) {
            interaction.editReply(
              `${interaction.member.user}, please connect to voice channel, so we can unmute you.`,
            )
          }
        }
      }
    }
  },
})

function isMutedForSeverePunishment(
  interaction: ChatInputCommandInteraction<CacheType>,
): boolean {
  //TODO: will implement checking once the standard is agreed among a community.
  return true
}
