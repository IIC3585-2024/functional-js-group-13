const fs = require('fs')
const { regex } = require('./regex.js')

function generateCloseTags(Idents, realIdents) {
  if (Idents.length === realIdents.length) {
    return ''
  } else {
    const closed = Idents.slice(realIdents.length)
    const uniqueClosed = closed
      .map(([ident, _, isOrderedList]) => [ident, isOrderedList].join(','))
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(value => value.split(',')[1])
      .reverse()
      .map((isOrderedList) => {
        return `${isOrderedList === 'true' ? '</ol>' : '</ul>'}`
      })
    console.log('uniqueClosed', uniqueClosed)
    return uniqueClosed.join('\n') + '\n'
  }
}

function tranformToHTML(array) {
  const formatLine = (lines, index = 0, Idents = [], newArray = []) => {
    if (lines.length === index) {
      return newArray
    }
    const currentLine = lines[index]
    const currentIdent = currentLine.match(/^\s*/)[0].length
    const isList = regex.list.test(currentLine)
    const isBreak = currentLine === ''
    const isHeading = regex.heading.test(currentLine)
    const isOrderedList = regex.orderedList.test(currentLine)
    // console.log(currentLine)
    if (isList) {
      // Filtrar solo las identaciones menores o iguales a la actual
      const realIdents = Idents.filter(([_, ident, ...rest]) => ident <= currentIdent)
      const closeTags = generateCloseTags(Idents, realIdents)
      if (realIdents.length === 0) {
        // Caso primera lista
        if (currentIdent < 4) return formatLine(lines, index + 1, [[0, currentIdent, isOrderedList]], [...newArray,`${closeTags}` + `${isOrderedList ? '<ol>' : '<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>']) // List
        return formatLine(lines, index + 1, [], [...newArray, currentLine.replace(regex.list, '')]) // Code
      } else {
        const lastIdent = realIdents[realIdents.length - 1][1]
        const identDiff = currentIdent - lastIdent
        if (identDiff === 0) { // Caso misma linea
          if (realIdents[realIdents.length - 1][2] === isOrderedList) {
            return formatLine(lines, index + 1, realIdents, [...newArray,`${closeTags}` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
          } else {
            const newIdent = [...realIdents.slice(0, -1), [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]]
            return formatLine(lines, index + 1, newIdent, [...newArray,`${closeTags}` + `${isOrderedList ? '</ul>\n<ol>' : '</ol>\n<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
          }
        } else if (identDiff < 2) { // Caso no pasa de identacion
          if (realIdents[realIdents.length - 1][2] === isOrderedList) {
            return formatLine(lines, index + 1, [...realIdents, [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]], [...newArray, '<li>' + currentLine.replace(regex.list, '') + '</li>'])  
          } else {
            const newIdent = [...realIdents.slice(0, -1), [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]]
            return formatLine(lines, index + 1, newIdent, [...newArray, `${isOrderedList ? '</ul>\n<ol>' : '</ol>\n<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
          }
        } else if (identDiff < 6) { // Caso pasa a la siguiente identacion
          return formatLine(lines, index + 1, [...realIdents, [realIdents[realIdents.length - 1][0] + 1, currentIdent, isOrderedList]], [...newArray, `${closeTags}` + `${isOrderedList ? '<ol>' : '<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
        } else { // Caso se pasó de identacion
          return formatLine(lines, index + 1, realIdents,[...newArray, currentLine.replace(regex.list, '')])
        }
      }
    } else if (isBreak) {
      return formatLine(lines, index + 1, Idents, [...newArray, '<br>'])
    } else if (isHeading) {
      const closeTags = generateCloseTags(Idents, [])
      return formatLine(lines, index + 1, [], [...newArray, `${closeTags}<h${currentLine.match(/#/g).length}>${currentLine.replace(regex.heading, '')}</h${currentLine.match(/#/g).length}>`])
    } else {
      return formatLine(lines, index + 1, Idents, [...newArray, '<p>' + currentLine + '</p>'])
    }
  }

  const formatedArray = formatLine(array)
  return formatedArray
}

function markdownToHtml(markdownText) {
  const markdownArray = markdownText
    .replace(/\t+/g, '    ') // Replace tabs with 4 spaces
    .replace(/^(\s*\n)*/g, "") // Remove leading spaces and new lines
    .replace(/^\s*$/gm, "") // Remove empty lines
    .split('\n') // Split by lines
  const HTML = tranformToHTML(markdownArray).join('\n')
  console.log(HTML)
}

const markdown = fs.readFileSync('markdown.md', 'utf8')

markdownToHtml(markdown)