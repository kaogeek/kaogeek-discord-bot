const emojiRegex =/(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component})\s*/gu
const numberRegex = /-?\d+(\.\d+)?/

export default (msg: string): boolean => {
  const emoji = msg.match(emojiRegex)
  //the issue of #99(https://github.com/creatorsgarten/kaogeek-discord-bot/pull/99) only happend with only number message,
  //so detect number in message and return false if there is.
  if (msg.trim().match(numberRegex)) return false

  return emoji !== null && emoji.join('').trim() === msg.trim()
}
