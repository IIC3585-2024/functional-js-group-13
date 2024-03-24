const _  = require('lodash')
const fs = require('fs');

const inputMarkdownExample = `
# Título Principal

Este es un párrafo de texto normal. Markdown es una forma sencilla de dar formato a documentos utilizando texto plano. Puedes negritas texto, *cursivas* e incluso crear listas:

1. Primer elemento de la lista
7. Segundo elemento de la lista
4. Tercer elemento de la lista

También puedes crear listas no ordenadas:
- Elemento uno
- Elemento dos
- Elemento tres

Además, Markdown permite añadir enlaces [como este](https://www.example.com) y también imágenes ![imagen de ejemplo](https://www.example.com/imagen.jpg).

## Subtítulo

Este es otro párrafo. Markdown es muy útil para crear documentos simples y legibles rápidamente.
`

const titleFormatter = (lines) =>
  lines.map(line =>
    '<h' + line.split(" ")[0].length + '>' + line.split(" ").slice(1).join(" ") + '</h' + line.split(" ")[0].length + '>')

const isTitleType = (line) => (line && line.split(" ")[0].includes("#"))

const noOrderedListFormatter = (lines) =>
  ["<ul>", lines.map((line) => "  <li>" + line.split(" ").slice(1).join(" ") + "</li>"), "</ul>"]

const isNotOrderListType = (line) => line.split(" ")[0].includes("-")

const orderListFormatter = (lines) =>
  ["<ol>", lines.map((line) => "  <li>" + line.split(" ").slice(1).join(" ") + "</li>"), "</ol>"]

const isOrderListType = (line) =>
  _.isNumber(parseInt(line.split(".")[0])) && _.last(line.split(" ")[0]) === "."

const isNormalLine = (line) => line != "" ? "<p>" + line + "</p>" : line

const breakLine = (line) => line === "" ? "<br>" : "<br>"

const getStrongWords = (line) => line.split(" **").filter((word) => word.includes("**")).map((word) => word.split("**")[0])

const strongWordsFormatter = (line, strongWords) => strongWords.reduce((acc, word) => acc.replace("**" + word + "**", "<strong>" + word + "</strong>"), line)

const markdownToHtml = (markdown) => {
  const separateLines = markdown.split("\n")
  const blockConverters = [
    [isTitleType, titleFormatter],
    [isNotOrderListType, noOrderedListFormatter],
    [isOrderListType, orderListFormatter],
    [(line) => line != "", isNormalLine],
    [(line) => line == "", breakLine],
  ];

  const blocks = separateLines.reduce((blocksArray, line) => {
    const [, functionType] = blockConverters.find(([isType]) => isType(line));
    const strongWords = getStrongWords(line)
    line = !_.isEmpty(strongWords) ? strongWordsFormatter(line, strongWords) : line
    return functionType == _.last(blocksArray)?.[0] ? blocksArray.map((block, index) =>
      index === blocksArray.length - 1 ? [...block, line] : block) : [...blocksArray, [functionType, line]]
  }
    , [])
  const result = blocks.map(([func, ...args]) => func(args));
  //console.log(result.flat(Infinity).join('\n'))
  return result.flat(Infinity).join('\n')
}

// Para leer un archivo
const leerArchivo = (nombreArchivo) => {
  return fs.readFileSync(nombreArchivo, { encoding: 'utf8', flag: 'r' })
}
const guardarArchivo = (nombreArchivo, texto) => {
    return fs.writeFileSync(nombreArchivo, texto)
}
// recibe f1,f2,f3 y retorna f1 o f2 o f3 (value_0)
const compose = (...functions) => {
  return (value_0) => functions.reduceRight((value,fn) => {return fn(value)}, value_0)
}

//markdownToHtml(inputMarkdownExample)
//const a = compose(markdownToHtml, leerArchivo)("markdown2.md")
//console.log(a)
guardarArchivo("index.html" , compose(markdownToHtml, leerArchivo)("markdown2.md"))

//(texto)=> {console.log(texto === inputMarkdownExample)}
//console.log("AAAA",inputMarkdownExample[1])