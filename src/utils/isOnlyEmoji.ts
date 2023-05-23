const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}|:\w+:\s*)/gu

export default (msg: string): boolean => {
  const emoji = msg.match(emojiRegex)
  if (emoji !== null) {
    const unicoded = emoji.map((emo) => {
      return emo.codePointAt(0)
    })
    for (const i of unicoded) {
      if (i !== undefined && isNumber(i)) {
        return false
      }
    }
  }
  return emoji !== null && emoji.join('').trim() === msg.replace(/\s/g, '')
}

function isNumber(input: number): boolean {
  return input >= 0x30 && input <= 0x39 //0x30 to 0x39 is range of number unicode from 0 to 9.
}
