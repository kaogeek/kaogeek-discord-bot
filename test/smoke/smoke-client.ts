import { Client, IntentsBitField } from 'discord.js'

import { Environment } from './smoke-config.js'

export default class Bot extends Client {
  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    })
  }

  async initAndStart() {
    await this.login(Environment.SMOKE_TESTER_BOT_TOKEN)
  }
}
