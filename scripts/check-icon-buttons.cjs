#!/usr/bin/env node
/** @format */

const fs = require("fs");
const path = require("path");

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const regex = /<Button[^>]*size=\"icon\"[^>]*>/g;
  let match;
  let errors = [];
  while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const snippet = content.substring(start, end + 200); // read some context
    if (
      !/aria-label=\"[\s\S]*?\"/.test(snippet) &&
      !/aria-label=\'{[\s\S]*?}\'/.test(snippet)
    ) {
      errors.push({ file: filePath, snippet: snippet.trim().split("\n")[0] });
    }
  }
  return errors;
}

const files = walk(path.join(process.cwd(), "src"));
let allErrors = [];
files.forEach((file) => {
  allErrors = allErrors.concat(checkFile(file));
});

if (allErrors.length) {
  console.error("Found icon-only Button instances without aria-label:");
  allErrors.forEach((err) => {
    console.error(` - ${err.file}: ${err.snippet}`);
  });
  process.exit(1);
} else {
  console.log("All icon-only Buttons have aria-labels (check passed).");
}
