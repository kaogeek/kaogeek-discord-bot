import { EventHandlerConfig } from '../types/event-handler-config.types'

export default {
  eventName: 'ready',
  once: true,
  execute: async (client) => {
    console.log(`Helloworld, Online as ${client.user?.tag}.`)
  },
} satisfies EventHandlerConfig<'ready'>
