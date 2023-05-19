const urlRegex =
  /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))?/gi

export default (str: string): RegExpMatchArray | null => {
  // console.log(str.match(urlRegex));
  return str.match(urlRegex)
}
