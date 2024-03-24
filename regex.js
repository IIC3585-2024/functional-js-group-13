const regex = {
  list: /^\s*(- |\* |\+ |[1-9]\d*\. )/,
  unorderedList: /^\s*(- |\* |\+ )/,
  orderedList: /^\s*([1-9]\d*\. )/,
  heading: /^\s*#{1,6}\s+/,
  horizontalRule: /^ {0,4}(?:_{3,}|-{3,}|\*{3,})\s*$/,
  bold: /\*\*(.*?)\*\*|__(.*?)__/,
  italic: /\*(.*?)\*|_(.*?)_/,
  strikethrough: /~~(.*?)~~/,
}

module.exports = { regex }