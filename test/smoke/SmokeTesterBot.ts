import { Client, IntentsBitField } from 'discord.js'

import { Environment } from './SmokeConfig.js'

export class SmokeTesterBot {
  public readonly client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  })

  async initAndStart() {
    await this.client.login(Environment.SMOKE_TESTER_BOT_TOKEN)
  }
}
