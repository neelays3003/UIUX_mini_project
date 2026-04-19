const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let changedFiles = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Replace xl and 2xl with md
  newContent = newContent.replace(/backdrop-blur-2xl/g, 'backdrop-blur-md');
  newContent = newContent.replace(/backdrop-blur-xl/g, 'backdrop-blur-md');
  // Replace lg with sm
  newContent = newContent.replace(/backdrop-blur-lg/g, 'backdrop-blur-sm');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log(`Replaced heavy backdrop-blur classes in ${changedFiles} files.`);
