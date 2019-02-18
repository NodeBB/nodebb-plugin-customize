import { RequestHandler } from 'express';
import { join, relative } from 'path';
import { promisify } from 'util';
import { readJson } from 'fs-extra';

import { build } from './pubsub';
import * as db from './database';

if (!require.main) { throw Error('[plugin-customize] `require.main` is undefined'); }
const nconf = require.main.require('nconf');
const User = require.main.require('./src/user');
const Languages = require.main.require('./src/languages');
const File = require.main.require('./src/file');
const Translator = require.main.require('./src/translator');
const Utils = require.main.require('./src/utils');

const escape = (dirty: string): string => Translator.escape(Utils.escapeHTML(dirty));

const listLanguages: () => Promise<{
  code: string;
  name: string;
}[]> = promisify(Languages.list);
const getSettings: (uid: number) => Promise<{ userLang: string }> = promisify(User.getSettings);
const walk: (base: string) => string[] = promisify(File.walk);

// eslint-disable-next-line import/no-dynamic-require
const version: string = require(join(__dirname, '../../package.json')).version;

let namespaceCache: string[] = [];
async function listNamespaces(): Promise<string[]> {
  if (namespaceCache.length) {
    return namespaceCache;
  }

  const metadataFile = join(nconf.get('base_dir'), 'build/public/language/metadata.json');
  const metadata: {
    namespaces: string[];
  } = await readJson(metadataFile);

  namespaceCache = metadata.namespaces;
  return namespaceCache;
}

let templateCache: string[] = [];
async function listTemplates(): Promise<string[]> {
  if (templateCache.length) {
    return templateCache;
  }

  const viewsDir = nconf.get('views_dir');
  const templates = await walk(viewsDir);

  templateCache = templates
    .filter(path => path.endsWith('.tpl'))
    .map(
      path => relative(viewsDir, path).split(/\/\\/).join('/')
    );
  return templateCache;
}

const renderAdmin: RequestHandler = (req, res, next): void => {
  Promise.all([
    db.getTemplates(),
    db.getTranslations(),
    listLanguages(),
    getSettings(req.uid).then(({ userLang }) => userLang),
    listNamespaces(),
    listTemplates(),
  ])
    .then(([
      templates,
      translations,
      languages,
      userLang,
      namespaces,
      templatePaths,
    ]) => {
      res.render('admin/plugins/customize', {
        version,
        templates: templates.map(x => ({
          path: x.path,
          json: escape(JSON.stringify(x)),
          diff: escape(x.diff),
        })),
        translations,
        languages: languages.map(({ code, name }) => ({
          code,
          name,
          selected: code === userLang,
        })),
        namespaces: namespaces.map(name => ({ name })),
        templatePaths,
      });
    })
    .catch(err => next(err));
};
const adminBuild: RequestHandler = (req, res, next): void => {
  build().then(
    () => res.send('OK'),
    err => next(err)
  );
};

const adminEditTranslation: RequestHandler = (req, res, next): void => {
  const translation: Translation = req.body.translation;

  db.editTranslation(translation)
    .then(db.getTranslations)
    .then((translations) => {
      res.json({
        translations,
      });
    })
    .catch(err => next(err));
};
const adminRemoveTranslation: RequestHandler = (req, res, next): void => {
  db.removeTranslation(req.body.translation)
    .then(db.getTranslations)
    .then((translations) => {
      res.json({
        translations,
      });
    })
    .catch(err => next(err));
};

const adminEditTemplate: RequestHandler = (req, res, next): void => {
  const template: Template = req.body.template;

  db.editTemplate(template)
    .then(db.getTemplates)
    .then((templates) => {
      res.json({
        templates: templates.map(x => ({
          path: x.path,
          json: escape(JSON.stringify(x)),
          diff: escape(x.diff),
        })),
      });
    })
    .catch(err => next(err));
};
const adminRemoveTemplate: RequestHandler = (req, res, next): void => {
  db.removeTemplate(req.body.template)
    .then(db.getTemplates)
    .then((templates) => {
      res.json({
        templates: templates.map(x => ({
          path: x.path,
          json: escape(JSON.stringify(x)),
          diff: escape(x.diff),
        })),
      });
    })
    .catch(err => next(err));
};

export default function controllers({ router, middleware }: AppParams): void {
  router.get('/admin/plugins/customize', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/customize', renderAdmin);

  router.post('/api/admin/plugins/customize/edit/template', adminEditTemplate);
  router.post('/api/admin/plugins/customize/edit/translation', adminEditTranslation);

  router.delete('/api/admin/plugins/customize/delete/template', adminRemoveTemplate);
  router.delete('/api/admin/plugins/customize/delete/translation', adminRemoveTranslation);

  router.post('/api/admin/plugins/customize/build', adminBuild);
}
