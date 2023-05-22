import { boolean } from 'zod'

const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}|:\w+:\s*)/gu //new
//const emojiRegex = /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component})\s*/gu

export default (msg: string): boolean => {
  const emoji = msg.match(emojiRegex)
  //the issue of #99(https://github.com/creatorsgarten/kaogeek-discord-bot/pull/99) only happend with only number message,
  //so detect number in message and return false if there is.
  if (emoji !== null) {
    const unicoded = emoji.map((emo) => {
      return emo.codePointAt(0)?.toString(16)
    })
    for (const i of unicoded) {
      if (i !== undefined && isNumber(i)) {
        return false
      }
    }
  }
  return emoji !== null && emoji.join('').trim() === msg.replace(/\s/g, '')
}

function isNumber(input: string): boolean {
  const numberUnicode = [
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
  ]
  return numberUnicode.includes(input)
}
