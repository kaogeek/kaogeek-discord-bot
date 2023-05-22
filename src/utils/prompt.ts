import {
  ComponentType,
  MessageComponentInteraction,
  TextInputStyle,
} from 'discord.js'

import { randomUUID } from 'node:crypto'

/**
 * Prompt for a single text input in Discord.
 *
 * @param interaction - the interaction that will trigger the prompt
 * @returns a submission object or undefined if the prompt timed out. You should reply to `submission.interaction` with a message.
 */
export async function prompt(
  interaction: MessageComponentInteraction,
  title: string,
  label: string,
) {
  const promptId = randomUUID() as string
  await interaction.showModal({
    customId: promptId,
    title,
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            customId: 'text',
            label,
            type: ComponentType.TextInput,
            style: TextInputStyle.Short,
            required: true,
          },
        ],
      },
    ],
  })

  const submitted = await interaction
    .awaitModalSubmit({
      time: 5 * 60_000,
      filter: (index) => index.customId === promptId,
    })
    .catch(() => null)

  if (!submitted) {
    return
  }

  return {
    text: submitted.fields.getTextInputValue('text'),
    interaction: submitted,
  }
}
