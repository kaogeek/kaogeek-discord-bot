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

  // Discord.js says that `threads` is an `APIChannel`, but it is actually an
  // `APIThreadChannel`, so a type assertion is needed.
  return result.threads as APIThreadChannel[]
}
