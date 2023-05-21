const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component})\s*/gu

/**
 * Check is only emoji message
 * @param msg - the input message
 * @returns true if message has only emoji other return false
 */
export default (msg: string): boolean => {
  const emoji = msg.match(emojiRegex)

  return emoji !== null && emoji.join('').trim() === msg.trim()
}
