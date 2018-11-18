const asciidoctor = require('asciidoctor.js')()
require('asciidoctor.js-pug')
const util = require('util')
const fs = require('fs')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const puppeteer = require('puppeteer')

async function convert(inputFile, options) {
  const doc = asciidoctor.loadFile(inputFile, options)
  const html = doc.convert(options)
  const workingDir = path.dirname(inputFile)
  const inputFilenameWithoutExt = path.basename(inputFile, path.extname(inputFile))
  const outputFile = path.join(workingDir, inputFilenameWithoutExt + '.pdf')
  let tempFile;
  if (path.isAbsolute(workingDir)) {
    tempFile = path.join(workingDir, inputFilenameWithoutExt + '_temp.html')
  } else {
    tempFile = path.normalize(path.join(process.cwd(), workingDir, inputFilenameWithoutExt + '_temp.html'))
  }
  const puppeteerConfig = {
    headless: true,
    args: ['--no-sandbox']
  }
  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage()
  page.on('pageerror', function (err) {
    console.log('Page error: ' + err.toString())
  }).on('error', function (err) {
    console.log('Error: ' + err.toString())
  })
  await writeFile(tempFile, html)
  await page.goto('file://' + tempFile, {waitUntil: 'networkidle2'})
  const pdfOptions = {
    path: outputFile,
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate:`<style>.footer{font-size:12px; color:#333; margin-left:20px; margin-right: 20px; padding-top: 5px; border-top:.5px solid #777; width: 100%}</style><div class="footer"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`
  }
  let pdfWidth = doc.getAttributes()['pdf-width']
  if (pdfWidth) {
    pdfOptions.width = pdfWidth
  }
  let pdfHeight = doc.getAttributes()['pdf-height']
  if (pdfHeight) {
    pdfOptions.height = pdfHeight
  }
  let pdfSize = doc.getAttributes()['pdf-size']
  if (pdfSize) {
    pdfOptions.size = pdfSize
  }
  return await page.pdf(pdfOptions)
}

module.exports = {
  convert: convert
}
