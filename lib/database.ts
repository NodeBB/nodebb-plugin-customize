// types and helper functions for database

import { promisify } from 'util';
import { join } from 'path';
import { readJson, readFile } from 'fs-extra';
import { applyPatch } from 'diff';

if (!require.main) { throw Error('[plugin-customize] `require.main` is undefined'); }
const db = require.main.require('./src/database');
const nconf = require.main.require('nconf');

const getSortedSetRange: (
  key: string,
  start: number,
  end: number
) => Promise<string[]> = promisify(db.getSortedSetRange);
const getObjects: <T>(keys: string[]) => Promise<T[]> = promisify(db.getObjects);
const sortedSetAdd: (
  key: string,
  score: number,
  value: string
) => Promise<void> = promisify(db.sortedSetAdd);
const setObject: <T>(key: string, hash: T) => Promise<void> = promisify(db.setObject);
const remove: (key: string) => Promise<void> = promisify(db.delete);
const sortedSetRemove: (
  key: string,
  value: string,
) => Promise<void> = promisify(db.sortedSetRemove);

const languagesDir = join(nconf.get('base_dir'), 'build/public/language');
const viewsDir = nconf.get('views_dir');

const translationsSet = 'plugin-customize:translations';
const translationHashKey = (key: string): string => `${translationsSet}:${key}`;
const templatesSet = 'plugin-customize:templates';
const templateHashKey = (key: string): string => `${templatesSet}:${key}`;

interface TranslationHash {
  language: string;
  namespace: string;
  key: string;
  old: string;
  value: string;
}

// translation id looks like `<language>:<namespace>:<key>`

export async function getTranslations(): Promise<Translation[]> {
  const ids = await getSortedSetRange(translationsSet, 0, -1);
  const [hashes, currentValues]: [TranslationHash[], string[]] = await Promise.all([
    getObjects<TranslationHash>(ids.map(translationHashKey)),
    Promise.all(ids.map(async (id) => {
      const [language, namespace, key] = id.split(':');
      const filePath = join(languagesDir, language, `${namespace}.json`);
      const translations: { [key: string]: string } = await readJson(filePath).catch(() => ({}));
      return translations[key] || '';
    })),
  ]);

  return currentValues.map((current, i) => ({
    current,
    ...hashes[i],
  }));
}

export async function editTranslation({
  language,
  namespace,
  key,
  old,
  value,
}: Translation): Promise<void> {
  const id = `${language}:${namespace}:${key}`;

  await Promise.all([
    setObject<TranslationHash>(translationHashKey(id), {
      language,
      namespace,
      key,
      old,
      value,
    }),
    sortedSetAdd(translationsSet, Date.now(), id),
  ]);
}

export async function removeTranslation(id: string): Promise<void> {
  await Promise.all([
    remove(translationHashKey(id)),
    sortedSetRemove(translationsSet, id),
  ]);
}

interface TemplateHash {
  path: string;
  diff: string;
  old: string;
}

const PATCH_FAILED_NOTICE = `
<!--
Attention: PATCH FAILED
To fix this, you will need to delete this customization
and then recreate it manually.
-->
`;

export async function getTemplates(): Promise<Template[]> {
  const paths = await getSortedSetRange(templatesSet, 0, -1);
  const [hashes, currentValues]: [TemplateHash[], string[]] = await Promise.all([
    getObjects<TemplateHash>(paths.map(templateHashKey)),
    Promise.all(paths.map(async (path) => {
      const filePath = join(viewsDir, path);
      return await readFile(filePath, 'utf-8');
    })),
  ]);

  return currentValues.map((current, i) => {
    const patched = applyPatch(hashes[i].old, hashes[i].diff);
    if (patched === false) {
      return {
        ...hashes[i],
        path: paths[i],
        value: PATCH_FAILED_NOTICE + hashes[i].old,
      };
    }

    return {
      ...hashes[i],
      path: paths[i],
      value: patched as string,
    };
  });
}

export async function editTemplate({
  path,
  diff,
  old,
}: Template): Promise<void> {
  await Promise.all([
    setObject<TemplateHash>(templateHashKey(path), {
      path,
      diff,
      old,
    }),
    sortedSetAdd(templatesSet, Date.now(), path),
  ]);
}

export async function removeTemplate(path: string): Promise<void> {
  await Promise.all([
    remove(templateHashKey(path)),
    sortedSetRemove(templatesSet, path),
  ]);
}
