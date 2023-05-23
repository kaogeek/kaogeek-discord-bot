const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}|:\w+:\s*)/gu
export default (message: string): boolean => {
  const emoji = message.match(emojiRegex)
  if (emoji !== null) {
    const unicoded = emoji.map((emo) => {
      return emo.codePointAt(0)
    })
    for (const [index, value] of unicoded.entries()) {
      // the condition after number is to detect the unicode 0xFE0F next to number which mean to convert normal number to it emoji alternative.
      if (
        value !== undefined &&
        isNumber(value) &&
        index + 1 <= unicoded.length &&
        unicoded[index + 1] !== 0xfe0f
      ) {
        return false
      }
    }
  }
  return (
    emoji !== null && emoji.join('').trim() === message.replaceAll(/\s/g, '')
  )
}

function isNumber(input: number): boolean {
  return input >= 0x30 && input <= 0x39 //0x30 to 0x39 is range of number unicode from 0 to 9.
}
