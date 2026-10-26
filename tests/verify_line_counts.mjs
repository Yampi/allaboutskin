import fs from 'fs';
import path from 'path';

const frontendDir = path.resolve('frontend/src');

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files = files.concat(getAllFiles(fullPath, exts));
      }
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllFiles(frontendDir);
console.log(`Found ${files.length} code files in frontend/src.`);

let maxLines = 0;
let maxFile = '';
const violations = [];
const nearLimit = []; // > 120 lines
const stats = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/).length;
  const relPath = path.relative(frontendDir, file).replace(/\\/g, '/');

  stats.push({ file: relPath, lines });
  if (lines > maxLines) {
    maxLines = lines;
    maxFile = relPath;
  }

  if (lines > 180) {
    violations.push({ file: relPath, lines });
  } else if (lines > 120) {
    nearLimit.push({ file: relPath, lines });
  }
}

console.log('\n--- LINE COUNT AUDIT RESULTS ---');
console.log(`Total files scanned: ${files.length}`);
console.log(`Max lines in a single file: ${maxLines} (${maxFile})`);
console.log(`Violations (> 180 lines): ${violations.length}`);
console.log(`Near ceiling (121 - 180 lines): ${nearLimit.length}`);

if (violations.length > 0) {
  console.error('\n❌ VIOLATIONS FOUND:');
  for (const v of violations) {
    console.error(`  - ${v.file}: ${v.lines} lines`);
  }
  process.exit(1);
} else {
  console.log('\n✅ ALL COMPONENTS COMPLY WITH STRICT < 180 LINES HARD CEILING!');
  if (nearLimit.length > 0) {
    console.log('Files between 121 and 180 lines:');
    for (const nl of nearLimit) {
      console.log(`  - ${nl.file}: ${nl.lines} lines`);
    }
  }
  process.exit(0);
}
