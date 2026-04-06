const fs = require('fs');
const path = require('path');
 
const projectRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(
  projectRoot,
  'src',
  'components',
  'Resumes',
  'Preview',
  'templates'
);
const outFile = path.join(templatesDir, 'registry.generated.ts');
 
function toPascalCase(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}
 
function findTemplateEntries() {
  const entries = fs.readdirSync(templatesDir, { withFileTypes: true });
  const templateDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => name !== 'thumbnail' && name !== '__tests__')
    .sort((a, b) => a.localeCompare(b));
 
  const results = [];
 
  for (const dirName of templateDirs) {
    const dirPath = path.join(templatesDir, dirName);
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    const componentFiles = files
      .filter((f) => f.isFile())
      .map((f) => f.name)
      .filter((fileName) => /^[A-Z].*\.tsx$/.test(fileName))
      .sort((a, b) => a.localeCompare(b));
 
    if (componentFiles.length === 0) continue;
 
    const componentFile = componentFiles[0];
    const importPath = `./${dirName}/${componentFile.replace(/\.tsx$/, '')}`;
    const importName = `Template${toPascalCase(dirName)}`;
 
    results.push({ templateId: dirName, importName, importPath });
  }
 
  return results;
}
 
function generateFile(entries) {
  const imports = entries
    .map((e) => `import ${e.importName} from '${e.importPath}';`)
    .join('\n');
 
  const mappings = entries.map((e) => `  '${e.templateId}': ${e.importName},`).join('\n');
 
  return [
    `import type { ComponentType } from 'react';`,
    `import type { TemplateProps } from '../../../../types/resume';`,
    ``,
    imports,
    ``,
    `export const TEMPLATE_COMPONENTS: Record<string, ComponentType<TemplateProps>> = {`,
    mappings,
    `};`,
    ``,
  ].join('\n');
}
 
function writeIfChanged(filePath, contents) {
  try {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing === contents) return false;
  } catch {}
 
  fs.writeFileSync(filePath, contents, 'utf8');
  return true;
}
 
function main() {
  if (!fs.existsSync(templatesDir)) {
    throw new Error(`Templates directory not found: ${templatesDir}`);
  }
 
  const entries = findTemplateEntries();
  const content = generateFile(entries);
  const changed = writeIfChanged(outFile, content);
  if (changed) {
    process.stdout.write(`Generated ${path.relative(projectRoot, outFile)}\n`);
  }
}
 
main();
