import { MessageComponentInteraction, TextBasedChannel } from 'discord.js'

import { randomUUID } from 'node:crypto'

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
   * Like `filter`, but also checks if the user ID matches the given user ID.
   * If the user ID does not match, the user will get a reply saying they are not allowed to use this action.
   * @param userId - the user ID to check against
   * @returns a filter function that can be passed to interaction collectors
   */
  createFilterWithUserIdProtection(userId: string) {
    return (interaction: MessageComponentInteraction) => {
      const match = this.filter(interaction)
      if (match && interaction.user.id !== userId) {
        interaction
          .reply({
            content: `You are not allowed to use this action. Only <@${userId}> is allowed to use this action.`,
            ephemeral: true,
          })
          .catch(console.error)
        return false
      }
      return match
    }
  }

  /**
   * Waits for a registered action to occur in a channel.
   * @param channel - the channel to wait for the action in
   * @param timeout - the timeout in milliseconds
   * @param user - the user to wait for the action from (other users will get a reply saying they are not allowed)
   * @returns the interaction and the registered action, or undefined if the timeout was reached
   */
  awaitInChannel = async (
    channel?: TextBasedChannel | null,
    timeout = 60_000,
    user?: { id: string },
  ) => {
    if (!channel) return
    const interaction = await channel
      .awaitMessageComponent({
        filter: user
          ? this.createFilterWithUserIdProtection(user.id)
          : this.filter,
        time: timeout,
      })
      .catch(() => null)
    if (!interaction) return
    const registeredAction = this.resolve(interaction)
    if (!registeredAction) return
    return { interaction, registeredAction }
  }
}

export interface RegisteredAction<T> {
  name: string
  handler: T
}
