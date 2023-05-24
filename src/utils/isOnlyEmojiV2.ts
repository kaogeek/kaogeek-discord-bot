const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component}|:\w+:\s*)/gu
  export default (message: string): boolean => {
    const emojiMatches = message.match(emojiRegex);
    // console.log("v2 emoji : ",emojiMatches);
    if (emojiMatches === null) {
      return false;
    }
    // console.log("v2 emoji : ",emojiMatches
    // .map(emo => emo.codePointAt(0)));
    const unicoded = emojiMatches
      .map(emo => emo.codePointAt(0))
      .filter((codePoint): codePoint is number => codePoint !== undefined);
    
    for (let i = 0; i < unicoded.length; i++) {
      if (isEmojiNumber(unicoded[i], unicoded[i + 1])) {
        // Skip the next unicode as we already checked it in isEmojiNumber function.
        i+=2;
      } else if (unicoded[i] >= 0x30 && unicoded[i] <= 0x39) {
        // If the current unicode is a number but not an emoji number, return false.
        return false;
      }
    }
  
    return emojiMatches.join('').trim() === message.replaceAll(/\s/g, '');
  }

function isEmojiNumber(input: number, nextInput: number): boolean {
  // Unicode 0x30 to 0x39 is range of number from 0 to 9. 
  // The following unicode 0xFE0F denotes that the number is represented as an emoji.
  return input >= 0x30 && input <= 0x39 && nextInput === 0xFE0F;
}