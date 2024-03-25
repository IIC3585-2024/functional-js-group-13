
export const regex = {
  horizontalRule: {regex: /^ {0,4}(-{3,}|\*{3,}|_{3,})/, replace: '<hr>'},
  bold: {regex: /\*\*(.*?)\*\*|__(.*?)__/g, replace: '<strong>$1$2</strong>'},
  italic: {regex: /\*(.*?)\*|_(.*?)_/g, replace: '<em>$1$2</em>'},
  strikethrough: {regex: /~~(.*?)~~/g, replace: '<strike>$1</strike>'},
  code: {regex: /``(.*?)``/g, replace: '<code>$1</code>'},
}
