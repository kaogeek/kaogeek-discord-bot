const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component})\s*/gu

export default (message: string): boolean => {
  const emoji = message.match(emojiRegex)

  return emoji !== null && emoji.join('').trim() === message.trim()
}
