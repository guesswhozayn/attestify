const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTEXT_FILE_PATH = path.join(ROOT_DIR, 'context.md');

// Directories and files to exclude from the tree to save token usage
const EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  'package-lock.json',
  '.DS_Store',
  'artifacts',
  'cache',
  'uploads',
  'temp',
];

function buildTree(dir, prefix = '') {
  let result = '';
  
  if (!fs.existsSync(dir)) return result;
  
  const files = fs.readdirSync(dir)
    .filter(file => !file.startsWith('.') && !EXCLUDES.includes(file))
    .sort((a, b) => {
      // Sort directories first, then files alphabetically
      const aStat = fs.statSync(path.join(dir, a));
      const bStat = fs.statSync(path.join(dir, b));
      if (aStat.isDirectory() && !bStat.isDirectory()) return -1;
      if (!aStat.isDirectory() && bStat.isDirectory()) return 1;
      return a.localeCompare(b);
    });

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isLastItem = index === files.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    
    result += `${prefix}${connector}${file}\n`;
    
    if (isDirectory) {
      const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
      result += buildTree(filePath, newPrefix);
    }
  });
  
  return result;
}

function updateContextFile() {
  if (!fs.existsSync(CONTEXT_FILE_PATH)) {
    console.error(`Error: Context file not found at ${CONTEXT_FILE_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(CONTEXT_FILE_PATH, 'utf8');

  // 1. Generate new file tree
  let tree = '.\n';
  tree += buildTree(ROOT_DIR);

  // Clean trailing newlines
  tree = tree.trim();

  // 2. Replace tree block
  const startMarker = '<!-- DIRECTORY_TREE_START -->';
  const endMarker = '<!-- DIRECTORY_TREE_END -->';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Error: Markers <!-- DIRECTORY_TREE_START --> and <!-- DIRECTORY_TREE_END --> not found in context.md');
    process.exit(1);
  }

  const beforeTree = content.substring(0, startIndex + startMarker.length);
  const afterTree = content.substring(endIndex);
  
  content = `${beforeTree}\n${tree}\n${afterTree}`;

  // 3. Update Last Updated Timestamp
  const now = new Date();
  const format2Digit = (num) => String(num).padStart(2, '0');
  const timestamp = `${now.getUTCFullYear()}-${format2Digit(now.getUTCMonth() + 1)}-${format2Digit(now.getUTCDate())} ${format2Digit(now.getUTCHours())}:${format2Digit(now.getUTCMinutes())}:${format2Digit(now.getUTCSeconds())} UTC`;

  content = content.replace(
    /\*Last Refactored \/ Updated:\* .*/,
    `*Last Refactored / Updated:* ${timestamp}`
  );

  fs.writeFileSync(CONTEXT_FILE_PATH, content, 'utf8');
  console.log(`Successfully updated ${CONTEXT_FILE_PATH} with latest directory map and timestamp (${timestamp})`);
}

updateContextFile();
