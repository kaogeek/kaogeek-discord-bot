import { afterEach, describe, expect, it, vi } from 'vitest'

import { isNeedToUpdateMessage } from '../../../../src/features/stickyMessage'
import * as messageCooldown from '../../../../src/features/stickyMessage/messageCooldown'
import * as messageCounter from '../../../../src/features/stickyMessage/messageCounter'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

describe('isNeedToUpdateMessage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return true if message count is equal to 5 even isChannelLock (cooldown) is true', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(5)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is equal to 5 and isChannelLock (cooldown) is false', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(5)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 even isChannelLock (cooldown) is true', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(8)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 and isChannelLock (cooldown) is false', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(8)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if isChannelLock (cooldown) is false and message count is less than 5', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(3)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return false if isChannelLock (cooldown) is true and message count is less than 5', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(2)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeFalsy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })
})
