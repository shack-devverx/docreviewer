// proof of concept for converting pptx to pdf
// copied from the documentation of office-to-pdf
// docs: https://www.npmjs.com/package/office-to-pdf
var toPdf = require("office-to-pdf")
var fs = require("fs")
var wordBuffer = fs.readFileSync("./test_docs/Sample_12.pptx")

toPdf(wordBuffer).then(
  (pdfBuffer) => {
    fs.writeFileSync("./test.pdf", pdfBuffer)
    console.log("PDF file written")
  }, (err) => {
    console.log(err)
  }
)