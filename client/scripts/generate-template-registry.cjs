const fs = require('fs');
const path = require('path');
 
const projectRoot = path.resolve(__dirname, '..');
const resumeTemplatesDir = path.join(
  projectRoot,
  'src',
  'components',
  'Resumes',
  'Preview',
  'templates'
);
const resumeOutFile = path.join(resumeTemplatesDir, 'registry.generated.ts');

const coverLetterTemplatesDir = path.join(
  projectRoot,
  'src',
  'components',
  'CoverLetters',
  'Preview',
  'templates'
);
const coverLetterOutFile = path.join(coverLetterTemplatesDir, 'registry.generated.ts');
 
function toPascalCase(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}
 
function findTemplateEntries(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const templateDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => name !== 'thumbnail' && name !== '__tests__')
    .sort((a, b) => a.localeCompare(b));
 
  const results = [];
 
  for (const dirName of templateDirs) {
    const dirPath = path.join(rootDir, dirName);
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
 
function generateResumeFile(entries) {
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

function generateCoverLetterFile(entries) {
  const imports = entries
    .map((e) => `import ${e.importName} from '${e.importPath}';`)
    .join('\n');
 
  const mappings = entries.map((e) => `  '${e.templateId}': ${e.importName},`).join('\n');
 
  return [
    `import type { ComponentType } from 'react';`,
    `import type { PersonalDetails, ThemeConfig, CoverLetter } from '../../../../types/resume';`,
    ``,
    imports,
    ``,
    `type CoverLetterTemplateProps = {`,
    `  personalDetails: PersonalDetails;`,
    `  coverLetter: CoverLetter;`,
    `  theme: ThemeConfig;`,
    `};`,
    ``,
    `export const COVER_LETTER_TEMPLATE_COMPONENTS: Record<string, ComponentType<CoverLetterTemplateProps>> = {`,
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
  if (!fs.existsSync(resumeTemplatesDir)) {
    throw new Error(`Templates directory not found: ${resumeTemplatesDir}`);
  }
 
  const resumeEntries = findTemplateEntries(resumeTemplatesDir);
  const resumeContent = generateResumeFile(resumeEntries);
  const resumeChanged = writeIfChanged(resumeOutFile, resumeContent);
  if (resumeChanged) {
    process.stdout.write(`Generated ${path.relative(projectRoot, resumeOutFile)}\n`);
  }

  if (!fs.existsSync(coverLetterTemplatesDir)) {
    throw new Error(`Templates directory not found: ${coverLetterTemplatesDir}`);
  }

  const coverLetterEntries = findTemplateEntries(coverLetterTemplatesDir);
  for (const e of coverLetterEntries) {
    e.importName = `Template${toPascalCase(e.templateId)}`;
  }
  const coverLetterContent = generateCoverLetterFile(coverLetterEntries);
  const coverLetterChanged = writeIfChanged(coverLetterOutFile, coverLetterContent);
  if (coverLetterChanged) {
    process.stdout.write(`Generated ${path.relative(projectRoot, coverLetterOutFile)}\n`);
  }
}
 
main();
