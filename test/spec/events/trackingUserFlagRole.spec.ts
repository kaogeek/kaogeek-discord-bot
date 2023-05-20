import { Collection, GuildMember, Role } from 'discord.js'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { Environment } from '../../../src/config.js'
import guildMemberUpdateHandler from '../../../src/events/guildMemberUpdate.js'
import { BotContext } from '../../../src/types/BotContext.js'

vi.mock('../../../src/config.js', async () => {
  const Environment = { FLAG_ROLE_ID: 'MOCK_FLAG_ROLE_ID' }

  return { Environment }
})
vi.mock('../../../src/prisma.js')

const MockRole = {
  id: Environment.FLAG_ROLE_ID,
  name: 'TestRole',
} as unknown as Role

const MockGuild = {
  name: 'TestGuild',
  id: '456',
  roles: {
    cache: new Collection<string, Role>([[Environment.FLAG_ROLE_ID, MockRole]]),
  },
}

const MockPrevMember = {
  nickname: 'OldNickname',
  roles: {
    cache: new Collection<string, Role>(),
  },
  guild: MockGuild,
} as unknown as GuildMember

const MockNextMember = {
  user: {
    tag: 'TestUser#1234',
    id: '789',
  },
  nickname: 'NewNickname',
  roles: {
    cache: new Collection<string, Role>(),
  },
  guild: MockGuild,
} as unknown as GuildMember

const MockClient = {} as unknown as BotContext

describe('guildMemberUpdate', () => {
  afterEach(() => {
    // Reset mock functions
    vi.clearAllMocks()
  })

  it('should add role to the user', async () => {
    const { prisma } = await import('../../../src/prisma.js')

    // Mock Prisma create
    prisma.userRole.create = vi.fn()

    const MockNextMember = {
      user: {
        tag: 'TestUser#1234',
        id: '789',
      },
      nickname: 'NewNickname',
      roles: {
        cache: new Collection<string, Role>([
          [Environment.FLAG_ROLE_ID, MockRole],
        ]),
      },
      guild: MockGuild,
    } as unknown as GuildMember

    guildMemberUpdateHandler.execute(MockClient, MockPrevMember, MockNextMember)
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: {
        roleId: Environment.FLAG_ROLE_ID,
        userId: '789',
      },
    })
  })

  it('should remove role from the user', async () => {
    const { prisma } = await import('../../../src/prisma.js')

    // Mock Prisma delete
    prisma.userRole.delete = vi.fn()

    const MockPrevMember = {
      nickname: 'OldNickname',
      roles: {
        cache: new Collection<string, Role>([
          [Environment.FLAG_ROLE_ID, MockRole],
        ]),
      },
      guild: MockGuild,
    } as unknown as GuildMember

    guildMemberUpdateHandler.execute(MockClient, MockPrevMember, MockNextMember)
    expect(prisma.userRole.delete).toHaveBeenCalledWith({
      where: {
        userId_roleId: { roleId: Environment.FLAG_ROLE_ID, userId: '789' },
      },
    })
  })
})
