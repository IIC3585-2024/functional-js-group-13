import _ from 'lodash'
import fs from 'fs'
import { regex } from './regex.js'

const titleFormatter = (lines) =>
  lines.map(line =>
    '<h' + line.trim().split(" ")[0].length + '>' + line.trim().split(" ").slice(1).join(" ") + '</h' + line.trim().split(" ")[0].length + '>')

const isTitleType = (line) => (line && line.trim().split(" ")[0].includes("#"))

const noOrderedListFormatter = (lines) => {
  const indentation = lines.map((line) => getIndentationCount(line))
  return ["<ul>", lines.map((line, index) => "  <li>" +
    (_.tail(line.trim().split(' ')).join(' ')) +
    (indentation[index] < indentation[index + 1] ? "\n<ul>" : "</li>") +
    ((indentation[index] > indentation[index + 1]) && indentation[index] > 0 ? "\n</ul>" + "\n</li>" : "") +
    (index === lines.length - 1 ? "</ul>" : "")
  ), "</ul>"]
}

const isNotOrderListType = (line) =>
  line.length > 0 && (line.split("* ")[0].trim() == "" || line.split("- ")[0].trim() == "" || line.split("+ ")[0].trim() == "")

const orderListFormatter = (lines) => {
  const start = lines[0].split(".")[0]
  const indentation = lines.map((line) => getIndentationCount(line))
  return [`<ol start=${start}>`, lines.map((line, index) => "  <li>" +
    (_.tail(line.split(".")).join(' ')) +
    (indentation[index] < indentation[index + 1] ? "\n<ol>" : "</li>") +
    ((indentation[index] > indentation[index + 1]) && indentation[index] > 0 ? "\n</ol>" + "\n</li>" : "")), "</ol>"]
}

const isOrderListType = (line) =>
  _.isNumber(parseInt(line.trim().split(".")[0])) && _.last(line.trim().split(" ")[0]) === "."

const isNormalLine = (lines) => lines.map(line => line != "" ? "<p>" + line + "</p>" : line)

const getFormattedWords = (line, delimiters) => {
  return delimiters.flatMap(delimiter =>
    line.split(delimiter).filter((_, i) => i % 2 === 1).filter(elemento => elemento !== '')
  );
}

const strongWordsFormatter = (line) => line.replace(regex.bold.regex, regex.bold.replace)
const italicWordsFormatter = (line) => line.replace(regex.italic.regex, regex.italic.replace)
const strikeThroughWordsFormatter = (line) => line.replace(regex.strikethrough.regex, regex.strikethrough.replace)
const codeWordsFormatter = (line) => line.replace(regex.code.regex, regex.code.replace)

const getIndentationCount = (line) => {
  return _.takeWhile(line, (char) => char === ' ').length;
};

const markdownToHtml = (markdown) => {
  const separateLines = markdown.split("\n").filter(line => line != "")
  const blockConverters = [
    [isTitleType, titleFormatter],
    [isNotOrderListType, noOrderedListFormatter],
    [isOrderListType, orderListFormatter],
    [(line) => line != "", isNormalLine],
  ];

  const blocks = separateLines.reduce((blocksArray, line) => {
    const [, functionType] = blockConverters.find(([isType]) => isType(line));
    line = ' ' + line
    const strongWords = getFormattedWords(line, ['**', '__'])
    const italicWords = getFormattedWords(line, ['*', '_']);
    const strikeThroughWords = getFormattedWords(line, ['~~']);
    const codeWords = getFormattedWords(line, ['``']);
    line = !_.isEmpty(strongWords) ? strongWordsFormatter(line) : line
    line = !_.isEmpty(italicWords) ? italicWordsFormatter(line) : line
    line = !_.isEmpty(strikeThroughWords) ? strikeThroughWordsFormatter(line) : line
    line = !_.isEmpty(codeWords) ? codeWordsFormatter(line) : line
    line = line.replace(regex.horizontalRule.regex, regex.horizontalRule.replace)
    return functionType == _.last(blocksArray)?.[0] ? blocksArray.map((block, index) =>
      index === blocksArray.length - 1 ? [...block, line] : block) : [...blocksArray, [functionType, line]]
  }
    , [])

  const result = blocks.map(([func, ...args]) => func(args));
  return result.flat(Infinity).join('\n')
}

const leerArchivo = (nombreArchivo) => {
  return fs.readFileSync(nombreArchivo, { encoding: 'utf8', flag: 'r' })
}
const guardarArchivo = (nombreArchivo, texto) => {
  return fs.writeFileSync(nombreArchivo, texto)
}
const compose = (...functions) => {
  return (value_0) => functions.reduceRight((value, fn) => { return fn(value) }, value_0)
}

guardarArchivo("index.html", compose(markdownToHtml, leerArchivo)("markdown.md"))
