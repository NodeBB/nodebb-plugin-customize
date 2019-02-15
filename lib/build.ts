import {
  writeFile,
  writeJson,
  copy,
  mkdirp,
  remove,
} from 'fs-extra';
import { join, dirname } from 'path';
import { flatMap } from 'lodash';

import { getTemplates, getTranslations } from './database';

if (!require.main) { throw Error('[plugin-customize] `require.main` is wrong'); }

const translationsSrcDir = join(__dirname, '../../public/language');
const templatesSrcDir = join(__dirname, '../../public/templates');
const translationsDir = join(__dirname, '../public/language');
const templatesDir = join(__dirname, '../public/templates');

export async function build(): Promise<void> {
  const [translations, templates]: [Translation[], Template[]] = await Promise.all([
    getTranslations(),
    getTemplates(),
  ]);

  const translationTree: {
    [language: string]: {
      [namespace: string]: {
        [key: string]: string;
      };
    };
  } = {};

  translations.forEach(({ language, namespace, key, value }) => {
    translationTree[language] = translationTree[language] || {};
    translationTree[language][namespace] = translationTree[language][namespace] || {};
    translationTree[language][namespace][key] = value;
  });

  // delete existing files
  await Promise.all([
    remove(translationsDir),
    remove(templatesDir),
  ]);

  await Promise.all([
    mkdirp(translationsDir),
    mkdirp(templatesDir),
  ]);

  // copy in own step to avoid conflicts
  await Promise.all([
    copy(translationsSrcDir, translationsDir),
    copy(templatesSrcDir, templatesDir),
  ]);

  const translationWrites = flatMap(
    Object.keys(translationTree),
    language => flatMap(
      Object.keys(translationTree[language]),
      async (namespace) => {
        const path = join(translationsDir, language, `${namespace}.json`);
        await mkdirp(dirname(path));
        await writeJson(path, translationTree[language][namespace]);
      }
    )
  );

  const templateWrites = templates.map(async ({ path, value }) => {
    const filePath = join(templatesDir, path);
    await mkdirp(dirname(filePath));
    await writeFile(filePath, value);
  });

  await Promise.all([
    ...translationWrites,
    ...templateWrites,
  ]);
}
