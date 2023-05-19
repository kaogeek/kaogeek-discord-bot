import { Events, Client, Message } from 'discord.js';
import { EventHandlerConfig } from '../types/EventHandlerConfig.js';
import getContainLinks from '../utils/getContainLinks.js';
import isLinkSafe from '../utils/isLinkSafe.js';

export default {
    eventName: Events.MessageCreate,
    once: false,
    execute: async (client: Client, message: Message) => {
        const urls = getContainLinks(message.content); // Get all links from the message.
        if (!urls) return; // No links found, so we don't need to do anything.
        for (const url of urls) {
            //TODO: isLinkSafe function is not implemented yet.
            const check = await isLinkSafe(url); // Check if the link is safe.
            if (!check) {
                await message.delete(); // Delete the message if the link is not safe.
                // Send a DM to the user
                await message.author.send({
                    embeds: [
                        {
                            title: 'Unsafe Link Detected',
                            description: `Your message in ${message.guild?.name} was removed because it contained a potentially unsafe link: ${url}`,
                            color: 0x00ff00
                        },
                    ],
                });
                break;
            }
        }
    }
} satisfies EventHandlerConfig<Events.MessageCreate>
