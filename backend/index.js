const express = require("express");
const toPdf = require("office-to-pdf");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const isFileValid = require("./validations/file-validation");

// create an express app
const app = express();
const PORT = 3000;

// Middleware to handle file uploads
app.use(fileUpload());

// enable CORS
app.use(cors());

// default endpoint to check if the server is running
app.get("/", (req, res) => {
  res.json({
    name: "PPTX to PDF Converter",
    version: "0.0.1",
    status: "running",
  });
});

// endpoint to handle PPTX to PDF conversion
app.post("/convert", async (req, res) => {
  const ALLOWED_EXTENSIONS = [".pptx", ".ppt", "docx", ".doc"];

  let pdfBuffer = null;
  const pptxFile = req.files ? req.files.pptxFile : null;

  // validate the file extension
  if (!isFileValid(pptxFile, ALLOWED_EXTENSIONS)) {
    return res.status(400).send("Invalid file extension.");
  }

  try {
    // converting the file to PDF
    pdfBuffer = await toPdf(pptxFile.data);
    
    // return error if the conversion have null value
    if (!pdfBuffer) return res.status(500).send("Conversion failed.");
  } catch (err) {
    res.status(500).send("Server error.");
  }

  // set the response headers
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="converted.pdf"',
    "Content-Length": pdfBuffer.length,
  });

  return res.send(pdfBuffer);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
