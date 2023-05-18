import { initTRPC } from '@trpc/server'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApiContext {}

const t = initTRPC.context<ApiContext>().create()

const appRouter = t.router({})

export async function startServer() {
  const server = fastify({
    maxParamLength: 5000,
  })

  server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { router: appRouter, createContext: () => ({}) },
  })

  await server.listen({ port: 3000 })
  return server
}
