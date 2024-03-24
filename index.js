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
    return uniqueClosed.join('\n') + '\n'
  }
}

function tranformToHTML(array) {
  const addTag = (tag) => (content) => `<${tag}>${content}</${tag}>`
  const formatLine = (lines, index = 0, Idents = [], newArray = []) => {
    const addLi = addTag('li')
    const addP = addTag('p')
    if (lines.length === index) {
      return newArray
    }
    const currentLine = lines[index]
    const currentIdent = currentLine.match(/^\s*/)[0].length
    const isList = regex.list.test(currentLine)
    const isBreak = currentLine === ''
    const isHeading = regex.heading.test(currentLine)
    const isOrderedList = regex.orderedList.test(currentLine)
    const isHorizontalRule = regex.horizontalRule.test(currentLine)
    
    // console.log(currentLine)
    const closeCompose = (Idents) => (realIdents) => generateCloseTags(Idents, realIdents)
    const closeTagsCompose = closeCompose(Idents)
    if (isList) {
      // Filtrar solo las identaciones menores o iguales a la actual
      const realIdents = Idents.filter(([_, ident]) => ident <= currentIdent)
      // Aux variables
      const closeTags = closeTagsCompose(realIdents)
      const listTag = `${isOrderedList ? '<ol>' : '<ul>'}\n`
      const content = currentLine.replace(regex.list, '')
      const closeAndOpenList = `${isOrderedList ? '</ul>\n<ol>' : '</ol>\n<ul>'}\n`

      if (realIdents.length === 0) {
        // Caso primera lista
        if (currentIdent < 4) return formatLine(lines, index + 1, [[0, currentIdent, isOrderedList]], [...newArray,`${closeTags}` + listTag + addLi(content)]) // List
        return formatLine(lines, index + 1, [], [...newArray, content]) // Code
      } else {
        //Aux
        const currentIdentAux = [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]

        const lastIdent = realIdents[realIdents.length - 1][1]
        const identDiff = currentIdent - lastIdent
      
        if (identDiff === 0) { // Caso misma linea
          if (realIdents[realIdents.length - 1][2] === isOrderedList) {
            return formatLine(lines, index + 1, realIdents, [...newArray,`${closeTags}` + addLi(content)])
          } else {
            const newIdent = [...realIdents.slice(0, -1), currentIdentAux]
            return formatLine(lines, index + 1, newIdent, [...newArray,`${closeTags}` + closeAndOpenList + addLi(content)])
          }
        } else if (identDiff < 2) { // Caso no pasa de identacion
          if (realIdents[realIdents.length - 1][2] === isOrderedList) {
            const currentIdentAux = [realIdents[realIdents.length - 1][0], currentIdent, isOrderedList]
            return formatLine(lines, index + 1, [...realIdents, currentIdentAux], [...newArray, addLi(content)])  
          } else {
            const newIdent = [...realIdents.slice(0, -1), currentIdentAux]
            return formatLine(lines, index + 1, newIdent, [...newArray, closeAndOpenList + addLi(content)])
          }
        } else if (identDiff < 6) { // Caso pasa a la siguiente identacion
          const nextIdentAux = [realIdents[realIdents.length - 1][0] + 1, currentIdent, isOrderedList]
          return formatLine(lines, index + 1, [...realIdents, nextIdentAux], [...newArray, `${closeTags}` + listTag + addLi(content)])
        } else { // Caso se pasó de identacion
          return formatLine(lines, index + 1, realIdents,[...newArray, content])
        }
      }
    } else if (isBreak) {
      return formatLine(lines, index + 1, Idents, [...newArray, '<br>'])
    } else if (isHeading) {
      // Aux variables
      const headingN = currentLine.match(/#/g).length
      const headingContent = currentLine.replace(regex.heading, '')

      const closeTags = closeTagsCompose([])
      return formatLine(lines, index + 1, [], [...newArray, `${closeTags}<h${headingN}>${headingContent}</h${headingN}>`])
    } else if (isHorizontalRule) {
      const closeTags = closeTagsCompose([])
      return formatLine(lines, index + 1, Idents, [...newArray, closeTags+'<hr>'])
    } else {
      if (currentIdent === 0) {
        const closeTags = closeTagsCompose([])
        return formatLine(lines, index + 1, Idents, [...newArray, closeTags + addP(currentLine)])
      } else {
      const realIdents = Idents.filter(([_, ident]) => ident <= currentIdent)
      const closeTags = closeTagsCompose(realIdents)
      return formatLine(lines, index + 1, [], [...newArray, closeTags + addP(currentLine)])
      } 
    }
  }
  const formatEmphasis = (lines) => {
    const addTag = (tag) => (content) => `<${tag}>${content}</${tag}>`
    const addStrong = addTag('strong')
    const addEm = addTag('em')
    const addDel = addTag('del')
    const addCode = addTag('code')
    const formatLine = (lines, index = 0, newArray = []) => {
      if (lines.length === index) {
        return newArray
      }
      const currentLine = lines[index]
        .replace(regex.bold, (_, g1, g2) => addStrong(g1 || g2))
        .replace(regex.italic, (_, g1, g2) => addEm(g1 || g2))
        .replace(regex.strikethrough, (_, g1) => addDel(g1))
        .replace(regex.code, (_, g1) => addCode(g1))

      return formatLine(lines, index + 1, [...newArray, currentLine])
    }
    return formatLine(lines)
  }

  const formatedArray = formatLine(array)
  const formatedArrayWithEmphasis = formatEmphasis(formatedArray)

  return formatedArrayWithEmphasis
}

function markdownToHtml(markdownText) {
  const markdownArray = markdownText
    .replace(/\t+/g, '    ') // Replace tabs with 4 spaces
    .replace(/^(\s*\n)*/g, "") // Remove leading spaces and new lines
    .replace(/^\s*$/gm, "") // Remove empty lines
    .split('\n') // Split by lines
  const HTMLText = tranformToHTML(markdownArray).join('\n')
  fs.writeFile('index.html', HTMLText, err => {
    if (err) {
      console.error(err);
    }
  });
}

const markdown = fs.readFileSync('markdown.md', 'utf8')

markdownToHtml(markdown)