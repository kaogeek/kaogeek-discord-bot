import {
  APIThreadChannel,
  Client,
  RESTGetAPIGuildThreadsResult,
  Routes,
} from 'discord.js'

export async function getActiveThreads(
  client: Pick<Client, 'rest'>,
  guild: { id: string },
) {
  const result = (await client.rest.get(
    Routes.guildActiveThreads(guild.id),
  )) as RESTGetAPIGuildThreadsResult
  return result.threads as APIThreadChannel[]
}
