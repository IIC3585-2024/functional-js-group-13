const fs = require('fs')
const { regex } = require('./regex.js')

function generateCloseTags(Idents, realIdents) {
  if (Idents.length === realIdents.length) {
    return ''
  } else {
    const closed = Idents.slice(realIdents.length).map(([ident, _, isOrderedList]) => {
      return `${isOrderedList ? '</ol>' : '</ul>'}`
    })
    return closed.join('\n') + '\n'
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
    const isOrderedList = regex.orderedList.test(currentLine)
    // console.log(currentLine)
    if (isList) {
      // Filtrar solo las identaciones menores o iguales a la actual
      const realIdents = Idents.filter(([_, ident, ...rest]) => ident <= currentIdent)
      const closeTags = generateCloseTags(Idents, realIdents)
      console.log("----------")
      console.log(currentLine)
      console.log("Total: ", Idents)
      console.log("Real: ", realIdents)
      if (realIdents.length === 0) {
        // Caso primera lista
        if (currentIdent < 4) return formatLine(lines, index + 1, [[0, currentIdent, isOrderedList]], [...newArray,`${closeTags}` + `${isOrderedList ? '<ol>' : '<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>']) // List
        return formatLine(lines, index + 1, [], [...newArray, currentLine.replace(regex.list, '')]) // Code
      } else {
        const lastIdent = realIdents[realIdents.length - 1][1]
        const identDiff = currentIdent - lastIdent
        if (identDiff === 0) { // Caso misma linea
          // console.log('Misma linea', identDiff)
          return formatLine(lines, index + 1, realIdents, [...newArray,`${closeTags}` + `${realIdents[realIdents.length - 1][2] === isOrderedList ? '' : `${isOrderedList ? '</ul>\n<ol>' : '</ol>\n<ul>'}\n`}` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
        } else if (identDiff < 2) { // Caso no pasa de identacion
          // console.log('No pasa de identacion', identDiff)
          return formatLine(lines, index + 1, [...realIdents, [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]], [...newArray, `${realIdents[realIdents.length - 1][2] === isOrderedList ? '' : `${isOrderedList ? '</ul>\n<ol>' : '</ol>\n<ul>'}\n`}` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
        } else if (identDiff < 6) { // Caso pasa a la siguiente identacion
          // console.log('Pasa a la siguiente identacion', identDiff)
          return formatLine(lines, index + 1, [...realIdents, [realIdents[realIdents.length - 1][0] + 1, currentIdent, isOrderedList]], [...newArray, `${closeTags}` + `${isOrderedList ? '<ol>' : '<ul>'}\n` + '<li>' + currentLine.replace(regex.list, '') + '</li>'])
        } else { // Caso se pasó de identacion
          // console.log('Se pasó de identacion', identDiff)
          return formatLine(lines, index + 1, realIdents,[...newArray, currentLine.replace(regex.list, '')])
        }
      }
    } else if (isBreak) {
      return formatLine(lines, index + 1, Idents, [...newArray, '<br>'])
    } else {
      return formatLine(lines, index + 1, Idents, [...newArray, '<p>' + currentLine + '</p>'])
    }
  }




  // const processLine = (lines, Idents = [[_, 0]], html = '') => {
  //   const inList = Idents.length > 1
  //   if (lines.length === 0) {
  //     return inList ? `${html}</ul>` : html
  //   }

  //   const [currentLine, ...rest] = lines
  //   const currentIdent = currentLine.match(/^\s*/)[0].length
  //   const isList = regex.unorderedList.test(currentLine)
  //   const isBreak = currentLine === ''
  //   const isOrderedList = regex.orderedList.test(currentLine)
  //   const isHeading = regex.heading.test(currentLine)

  //   if (isBreak) {
  //     return processLine(rest, currentIdent, html + '\n<br>')
  //   }
  //   if (isList || isOrderedList) {
  //     const newHtml = inList ? html : `${html}\n${isList ? '<ul>' : '<ol>'}`
      
  //     const IdentsDiff = currentIdent - Idents[Idents.length - 1][1]
      
  //     if (IdentsDiff >= 0) {
  //       if (IdentsDiff < 2) {
  //         const htmlLine = `${newHtml}\n<li>${currentLine.replace(regex.unorderedList, '')}</li>`
  //         return processLine(rest, [...Idents.slice(0, -1), currentIdent], htmlLine)
  //       } else if (IdentsDiff < 6) {
  //         const htmlLine = `${newHtml}\n<li>${currentLine.replace(regex.unorderedList, '')}</li>`
  //         return processLine(rest, [...Idents, currentIdent], htmlLine)
  //       } else {
  //         const newHtmlLine = `${newHtml}\n<p>`
  //         return processLine(rest, Idents, inList, htmlLine)
  //       }
  //     }
  //   }
  // }
  const formatedArray = formatLine(array)
  return formatedArray
}

function markdownToHtml(markdownText) {
  const markdownArray = markdownText
    .replace(/\t+/g, '    ') // Replace tabs with 4 spaces
    .replace(/^(\s*\n)*/g, "") // Remove leading spaces and new lines
    .replace(/^\s*$/gm, "") // Remove empty lines
    // .replace(/(\s*\n){3,}/g, "\n\n") // Replace multiple new lines with two
    .split('\n') // Split by lines
  const HTML = tranformToHTML(markdownArray).join('\n')
  console.log(HTML)
  // const htmlText = markdownArray.map(tranformToHTML).join('\n')

  // console.log(htmlText)
}

const markdown = fs.readFileSync('markdown.md', 'utf8')

// console.log(markdown)
markdownToHtml(markdown)