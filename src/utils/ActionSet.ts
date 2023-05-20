import { MessageComponentInteraction, TextBasedChannel } from 'discord.js'

import { randomUUID } from 'crypto'

/**
 * A utility class to help with the creation and execution of ephemeral actions.
 *
 * To use this class:
 *
 * 1. Create an instance of this class.
 * 2. Register actions using {@link ActionSet.register}. This will return a custom ID that can be used in Discord message components.
 * 3. Wait for an action using {@link ActionSet.awaitInChannel}.
 */
export class ActionSet<
  THandler = (interaction: MessageComponentInteraction) => Promise<void>,
> {
  private map = new Map<string, RegisteredAction<THandler>>()

  /**
   * Registers an action.
   * @param name - the name of the action, used for debugging
   * @param handler - the action handler
   * @returns a custom ID of the action that can be used in Discord
   */
  register(name: string, handler: THandler) {
    const customId = randomUUID() as string
    this.map.set(customId, { name, handler })
    return customId
  }

  /**
   * Resolves an action.
   * @param thing - something that has a custom ID
   */
  resolve(thing?: { customId: string }) {
    return thing ? this.map.get(thing.customId) : undefined
  }

  /**
   * A filter function that can be passed to interaction collectors.
   */
  filter = ({ customId }: { customId: string }) => this.map.has(customId)

  /**
   * Waits for a registered action to occur in a channel.
   * @param channel - the channel to wait for the action in
   * @param timeout - the timeout in milliseconds
   * @returns the interaction and the registered action, or undefined if the timeout was reached
   */
  awaitInChannel = async (
    channel?: TextBasedChannel | null,
    timeout = 60000,
  ) => {
    if (!channel) return undefined
    const interaction = await channel
      .awaitMessageComponent({
        filter: this.filter,
        time: timeout,
      })
      .catch(() => null)
    if (!interaction) return undefined
    const registeredAction = this.resolve(interaction)
    if (!registeredAction) return undefined
    return { interaction, registeredAction }
  }
}

export interface RegisteredAction<T> {
  name: string
  handler: T
}
