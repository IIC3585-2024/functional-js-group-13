const fs = require('fs')

const texto = "# Encabezado de primer nivel\nEste es el primer parrafo solo para **ilustrar** el uso"

function headingToHTML(text, isHead) {
  // # diference heading levels
  return `<h${level}>${content}</h${level}>`
}

function isHeading(array, index) {
  const currentLine = array[index].trim()
  const nextLine = array[index + 1].trim()
  if (currentLine.startsWith('#') && !currentLine.replace(/^#{1,6} /, '').startsWith('#')) {
    return currentLine.match(/^#{1,6} /)[0].length - 1
  } else if (/^[=]+$/.test(nextLine)) {
    return 1
  } else if (/^[-]+$/.test(nextLine)) {
    return 2
  }
  return 0
}

function tranformToHTML(text, index, array) {
  console.log('-------------------', index, '-------------------')
  const nextLine = array[index + 1]
  const prevLine = array[index - 1]
  console.log("ant: ", prevLine)
  console.log("act: ", text)
  console.log("sig: ", nextLine)
  // const headingNumber = isHeading(array, index)
  // if (headingNumber) {
  //   return headingToHTML(text, headingNumber)
  // }
  // HTMLtext = headingToHTML(text)
  return `<p>${text}</p>`
}

function removeLeadingSpaces(text, index, array) {
  const prevLineSpaces = array[index - 1]?.match(/^\s*/)[0]?.length
  const currentLineSpaces = text?.match(/^\s*/)[0]?.length

  if (currentLineSpaces < 2) {
    return text.replace(/^\s*/, '')
  }

  return text
}

function markdownToHtml(markdownText) {
  const markdownArray = markdownText
    .replace(/\t+/, '    ') // Replace tabs with 4 spaces
    .replace(/^(\s*\n)*/, "") // Remove leading spaces and new lines
    .replace(/(\s*\n){3,}/g, "\n\n") // Replace multiple new lines with two
    .split('\n') // Split by lines
    .map(removeLeadingSpaces) // Remove leading and trailing spaces
  // const htmlText = markdownArray.map(tranformToHTML).join('\n')

  console.log(markdownArray)
  // console.log(htmlText)
}

const markdown = fs.readFileSync('markdown.md', 'utf8')

// console.log(markdown)
markdownToHtml(markdown)