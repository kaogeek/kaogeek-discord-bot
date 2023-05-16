import { Client, Collection, IntentsBitField } from 'discord.js';
import { readdir } from 'fs/promises';

interface Command {
  name: string;
  execute: (...args: any[]) => void;
}

export default class Bot extends Client {
  public commands: Collection<string, Command>;
  public commandArray: Command[];

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
      ],
    });
    this.commands = new Collection();
    this.commandArray = [];
  }

  async init(): Promise<void> {
    try {
      await this.handler();
      await this.login(process.env.BOT_TOKEN);
    } catch (error) {
      console.error('Error initializing bot:', error);
    }
  }

  async handler(): Promise<void> {
    try {
      const eventFiles = await readdir(`${__dirname}/events`);
      const commandFolders = await readdir(`${__dirname}/commands`);
      await this.handleEvents(eventFiles, './events');
      await this.handleCommands(commandFolders, './commands');
    } catch (error) {
      console.error('Error handling events and commands:', error);
    }
  }

  async handleEvents(eventFiles: string[], path: string): Promise<void> {
    for (const file of eventFiles) {
      if (file[0] === '-') {
        continue;
      }
      try {
        const { default: event } = await import(`${path}/${file}`);
        if (event.once) {
          this.once(event.name, (...args) => event.execute(...args, this));
        } else {
          this.on(event.name, (...args) => event.execute(...args, this));
        }
      } catch (error) {
        console.error('Error loading event:', error);
      }
    }
  }

  async handleCommands(commandFolders: string[], path: string): Promise<void> {
    for (const folder of commandFolders) {
      const commandFiles = await readdir(`${path}/${folder}`);
      for (const file of commandFiles) {
        if (file[0] !== '-') {
          try {
            const { default: command } = await import(`${path}/${folder}/${file}`);
            this.commands.set(command.name, command);
            this.commandArray.push(command);
          } catch (error) {
            console.error('Error loading command:', error);
          }
        }
      }
    }
  }
}

new Bot().init();
