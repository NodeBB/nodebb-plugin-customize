import { RequestHandler } from 'express';
import { join } from 'path';
import { promisify } from 'util';
import { readJson } from 'fs-extra';

import { build } from './pubsub';
import * as db from './database';

if (!require.main) { throw Error('[plugin-customize] `require.main` is undefined'); }
const nconf = require.main.require('nconf');
const User = require.main.require('./src/user');
const Languages = require.main.require('./src/languages');

const listLanguages: () => Promise<{
  code: string;
  name: string;
}[]> = promisify(Languages.list);
const getSettings: (uid: number) => Promise<{ userLang: string }> = promisify(User.getSettings);

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

const renderAdmin: RequestHandler = (req, res, next): void => {
  Promise.all([
    db.getTemplates(),
    db.getTranslations(),
    listLanguages(),
    getSettings(req.uid).then(({ userLang }) => userLang),
    listNamespaces(),
  ])
    .then(([templates, translations, languages, userLang, namespaces]) => {
      res.render('admin/plugins/customize', {
        version,
        templates,
        translations,
        languages: languages.map(({ code, name }) => ({
          code,
          name,
          selected: code === userLang,
        })),
        namespaces: namespaces.map(name => ({ name })),
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
    .then(() => console.log('here3'))
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
        templates,
      });
    })
    .catch(err => next(err));
};
const adminRemoveTemplate: RequestHandler = (req, res, next): void => {
  db.removeTemplate(req.body.template)
    .then(db.getTemplates)
    .then((templates) => {
      res.json({
        templates,
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
