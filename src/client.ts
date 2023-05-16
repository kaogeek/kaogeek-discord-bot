import { Client, Collection, IntentsBitField } from 'discord.js';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export default class Bot extends Client {
    public commands: Collection<string, Dictionary>;
    public commandArray: Dictionary[];
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent
            ]
        });
        this.commands = new Collection()
        this.commandArray = [];
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            await this.handler();
            this.login(process.env.BOT_TOKEN)
        })
    }

    async handler() {
        const eventFiles = readdirSync(`/${__dirname}/events`).filter(file => file.endsWith(".js"));
        const commandFolders = readdirSync(`/${__dirname}/commands`).filter(file => file.endsWith(".js"));
        this.handleEvents(eventFiles, "./events");
        this.handleCommands(commandFolders, "./commands");
    };

    async handleEvents(eventFiles: string[], path: string) {
        for (const file of eventFiles) {
            if (file[0] === "-") {
            } else {
                try {
                    const event = require(`${path}/${file}`).default;
                    if (event.once) {
                        this.once(event.name, (...args) => event.execute(...args, this));
                    } else {
                        this.on(event.name, (...args) => event.execute(...args, this));
                    }
                } catch (error) {
                    console.log(error)
                }
            };
        };
    };

    async handleCommands(commandFolders: string[] = [], path: string) {

        for (const folder of commandFolders) {
            const commandFiles = readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                if (file[0] != "-") {
                    const command = require(`${path}/${folder}/${file}`);
                    this.commands.set(command.data.name, command);
                    this.commandArray.push(command.data);
                } else {
                    const command = require(`./commands/${folder}/${file}`);
                };
            };
        };
    };
}

declare global {
    type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>;
}

new Bot().init();