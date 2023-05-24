import { REST } from 'discord.js'

import { Environment } from '../../../config.js'
import { getActiveThreads } from '../getActiveThreads.js'
import { getThreadStats } from '../getThreadStats.js'

const rest = new REST().setToken(Environment.BOT_TOKEN)
const activeThreads = await getActiveThreads(
  { rest },
  { id: Environment.GUILD_ID },
)

const threadStats = getThreadStats(activeThreads)

for (const item of threadStats.pruningCriteria) {
  const percent = Math.round(
    (item.threadIds.length / activeThreads.length) * 100,
  )
  console.log(`- ${item.name}: ${item.threadIds.length} (${percent}%)`)
}
