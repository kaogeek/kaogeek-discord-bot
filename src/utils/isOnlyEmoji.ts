const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}|:\w+:\s*)/gu
export default (message: string): boolean => {
  const emoji = message.match(emojiRegex)
  if (emoji !== null) {
    // Convert each emoji to its Unicode code and filter out undefined
    const unicoded = emoji
      .map((emo) => emo.codePointAt(0))
      .filter((codePoint): codePoint is number => codePoint !== undefined)
    // Check if have any number -> not an emoji
    for (let index = 0; index < unicoded.length; index++) {
      if (isEmojiNumber(unicoded[index], unicoded[index + 1])) {
        // Skip the next unicode as we already checked it in isEmojiNumber function.
        index++
      } else if (unicoded[index] >= 0x30 && unicoded[index] <= 0x39) {
        // If the current unicode is a number but not an emoji number, return false.
        return false
      }
    }
  }
  return (
    emoji !== null && emoji.join('').trim() === message.replaceAll(/\s/g, '')
  )
}

function isEmojiNumber(input: number, nextInput: number): boolean {
  // Unicode 0x30 to 0x39 is range of number from 0 to 9.
  // The following unicode 0xFE0F denotes to Variation Selector-16
  // which is used to convert normal number to it emoji alternative.
  // The following unicode 0x20E3 denotes to Combining Enclosing Keycap
  // which is used to convert number to keycap emoji.
  return (
    input >= 0x30 &&
    input <= 0x39 &&
    (nextInput === 0xfe_0f || nextInput === 0x20_e3)
  )
}
