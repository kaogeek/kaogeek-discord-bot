const emojiRegex =
  /<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}/gu

export default (msg: string): boolean => {
  const emoji = msg.match(emojiRegex)

  return emoji && emoji.join('').trim() === msg.trim()
}
