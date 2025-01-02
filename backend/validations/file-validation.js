const path = require("path");

/**
 * Validate the file provided for conversion
 * @param {object} file - file object from the request
 * @param {string[]} allowedExtensions - allowed file extensions
 * @returns 
 */
function isFileValid(file, allowedExtensions) {
  // file is not provided
  if (!file) return false;

  // file extension is not allowed
  if (!allowedExtensions.includes(path.extname(file.name))) return false;

  return true;
}

module.exports = isFileValid;
