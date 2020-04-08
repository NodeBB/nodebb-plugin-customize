const {
  copy,
  mkdirp,
} = require('fs-extra');
const { join } = require('path');

const translationsSrcDir = join(__dirname, 'public/language');
const templatesSrcDir = join(__dirname, 'public/templates');
const translationsDir = join(__dirname, 'build/public/language');
const templatesDir = join(__dirname, 'build/public/templates');

async function copySources() {
  await Promise.all([
    mkdirp(translationsDir),
    mkdirp(templatesDir),
  ]);

  await Promise.all([
    copy(translationsSrcDir, translationsDir),
    copy(templatesSrcDir, templatesDir),
  ]);
}

copySources()
  .catch((err) => process.nextTick(() => { throw err; }));
