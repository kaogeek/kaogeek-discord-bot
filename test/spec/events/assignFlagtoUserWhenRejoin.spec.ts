import { GuildMember } from 'discord.js'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { Environment } from '../../../src/config.js'
import guildMemberAddHandler from '../../../src/events/guildMemberAdd.js'
import { BotContext } from '../../../src/types/BotContext.js'

vi.mock('../../../src/config.js', async () => {
  const Environment = { FLAG_ROLE_ID: 'MOCK_FLAG_ROLE_ID' }

  return { Environment }
})

vi.mock('../../../src/prisma.js')

// Mock newMember object
const mockNewMember = {
  user: {
    id: '123456789',
    tag: 'TestUser#1234',
  },
  guild: {
    id: '123456789',
    name: 'TestGuild',
  },
  roles: {
    add: vi.fn(),
  },
}

describe('guildMemberAddHandler', () => {
  afterEach(() => {
    // Reset mock functions
    vi.clearAllMocks()
  })

  it('should assign flag role to new member when userRole exists and roleId matches', async () => {
    const { prisma } = await import('../../../src/prisma.js')

    // Mock userRole data
    const mockUserRole = {
      userId: '123456789',
      roleId: Environment.FLAG_ROLE_ID,
    }
    // Mock Prisma client response
    prisma.userRole.findUnique = vi.fn().mockResolvedValue(mockUserRole)

    // Execute the handler
    await guildMemberAddHandler.execute(
      null as unknown as BotContext,
      mockNewMember as unknown as GuildMember,
    )

    // Assertions
    expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
      where: {
        userId_roleId: {
          userId: mockNewMember.user.id,
          roleId: Environment.FLAG_ROLE_ID,
        },
      },
    })
    expect(mockNewMember.roles.add).toHaveBeenCalledWith(mockUserRole.roleId)
  })

  it('should not assign flag role to new member when userRole does not exist', async () => {
    const { prisma } = await import('../../../src/prisma.js')

    // Mock Prisma client response (no userRole found)
    prisma.userRole.findUnique = vi.fn().mockResolvedValue(null)

    // Execute the handler
    await guildMemberAddHandler.execute(
      null as unknown as BotContext,
      mockNewMember as unknown as GuildMember,
    )

    // Assertions
    expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
      where: {
        userId_roleId: {
          userId: mockNewMember.user.id,
          roleId: Environment.FLAG_ROLE_ID,
        },
      },
    })
    expect(mockNewMember.roles.add).not.toHaveBeenCalled()
  })

  it('should not assign flag role to new member when roleId does not match', async () => {
    const { prisma } = await import('../../../src/prisma.js')

    // Mock userRole data with a different roleId
    const mockUserRole = {
      userId: '123456789',
      roleId: 'otherRoleId',
    }

    // Mock Prisma client response
    prisma.userRole.findUnique = vi.fn().mockResolvedValue(mockUserRole)

    // Execute the handler
    await guildMemberAddHandler.execute(
      null as unknown as BotContext,
      mockNewMember as unknown as GuildMember,
    )

    // Assertions
    expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
      where: {
        userId_roleId: {
          userId: mockNewMember.user.id,
          roleId: Environment.FLAG_ROLE_ID,
        },
      },
    })
    expect(mockNewMember.roles.add).not.toHaveBeenCalled()
  })
})
