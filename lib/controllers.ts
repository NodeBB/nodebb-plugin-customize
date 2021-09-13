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
const { setupApiRoute, setupAdminPageRoute } = require.main.require('./src/routes/helpers');
const { formatApiResponse } = require.main.require('./src/controllers/helpers');

const escape = (dirty: string): string => Translator.escape(Utils.escapeHTML(dirty));

const listLanguages: () => Promise<{
  code: string;
  name: string;
}[]> = promisify(Languages.list);
const getSettings: (uid: number) => Promise<{ userLang: string }> = promisify(User.getSettings);
const walk: (base: string) => string[] = promisify(File.walk);

// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
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
    .filter((path) => path.endsWith('.tpl'))
    .map(
      (path) => relative(viewsDir, path).split(/\/\\/).join('/')
    );
  return templateCache;
}

const renderAdmin: RequestHandler = async (req, res) => {
  const [
    templates,
    translations,
    languages,
    userLang,
    namespaces,
    templatePaths,
  ] = await Promise.all([
    db.getTemplates(),
    db.getTranslations(),
    listLanguages(),
    getSettings(req.uid).then((data) => data.userLang),
    listNamespaces(),
    listTemplates(),
  ]);
  res.render('admin/plugins/customize', {
    version,
    templates: templates.map((x) => ({
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
    namespaces: namespaces.map((name) => ({ name })),
    templatePaths,
  });
};
const adminBuild: RequestHandler = async (req, res) => {
  await build();
  formatApiResponse(200, res, 'OK');
};

const adminEditTranslation: RequestHandler = async (req, res) => {
  const translation: Translation = req.body.translation;

  await db.editTranslation(translation);
  const translations = await db.getTranslations();
  formatApiResponse(200, res, { translations });
};
const adminRemoveTranslation: RequestHandler = async (req, res) => {
  await db.removeTranslation(req.body.translation);
  const translations = await db.getTranslations();
  formatApiResponse(200, res, { translations });
};

const adminEditTemplate: RequestHandler = async (req, res) => {
  const template: Template = req.body.template;

  await db.editTemplate(template);
  const templates = await db.getTemplates();
  formatApiResponse(200, res, {
    templates: templates.map((x) => ({
      path: x.path,
      json: escape(JSON.stringify(x)),
      diff: escape(x.diff),
    })),
  });
};
const adminRemoveTemplate: RequestHandler = async (req, res) => {
  await db.removeTemplate(req.body.template);
  const templates = await db.getTemplates();
  formatApiResponse(200, res, {
    templates: templates.map((x) => ({
      path: x.path,
      json: escape(JSON.stringify(x)),
      diff: escape(x.diff),
    })),
  });
};

export default function controllers({ router, middleware }: AppParams): void {
  setupAdminPageRoute(router, '/admin/plugins/customize', middleware, [], renderAdmin);

  setupApiRoute(router, 'put', '/api/v3/admin/plugins/customize/edit/template', [middleware.admin.checkPrivileges], adminEditTemplate);
  setupApiRoute(router, 'delete', '/api/v3/admin/plugins/customize/delete/template', [middleware.admin.checkPrivileges], adminRemoveTemplate);

  setupApiRoute(router, 'put', '/api/v3/admin/plugins/customize/edit/translation', [middleware.admin.checkPrivileges], adminEditTranslation);
  setupApiRoute(router, 'delete', '/api/v3/admin/plugins/customize/delete/translation', [middleware.admin.checkPrivileges], adminRemoveTranslation);

  setupApiRoute(router, 'put', '/api/v3/admin/plugins/customize/build', [middleware.admin.checkPrivileges], adminBuild);
}
