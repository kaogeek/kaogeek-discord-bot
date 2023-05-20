import { ChannelType } from 'discord.js'

// Define a custom type called `supportedTextChannel` that represents the supported channel types
export type supportedTextChannel =
  | ChannelType.GuildText
  | ChannelType.GuildVoice
  | ChannelType.GuildStageVoice
  | ChannelType.PublicThread
  | ChannelType.PrivateThread
  | ChannelType.AnnouncementThread
