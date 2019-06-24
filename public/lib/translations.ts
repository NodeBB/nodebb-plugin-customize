import { Translator } from 'translator';
import * as Benchpress from 'benchpress';

import {
  setOptions,
  success,
  error,
  confirm,
  requestDelete,
  requestPost,
} from './shared';

const edit = {
  parent: $('#translation-edit'),
  language: $('#translation-edit-language'),
  namespace: $('#translation-edit-namespace'),
  key: $('#translation-edit-key'),
  value: $('#translation-edit-value'),
  old: $('#translation-edit-original'),
  submit: $('#translation-edit-submit'),
};

const list = $('#translations-list');

function updateKeys(): Promise<void> {
  const lang = edit.language.val() as string;
  const namespace = edit.namespace.val() as string | null;

  if (!namespace) {
    return Promise.resolve();
  }

  return Translator.create(lang).getTranslation(namespace)
    .then((translationMap) => {
      const keys = Object.keys(translationMap).map(key => ({
        value: key,
        text: key,
      }));
      setOptions(edit.key, keys);
      edit.key.prepend('<option value="">---</option>');
    });
}

function updateOld(): Promise<void> {
  const origData: Translation | null = edit.parent.data().translation;

  const lang = $('#translation-edit-language').val() as string;
  const namespace = $('#translation-edit-namespace').val() as string | null;
  const key = $('#translation-edit-key').val() as string | null;

  if (!namespace || !key) {
    return Promise.resolve();
  }

  if (
    origData &&
    lang === origData.language &&
    namespace === origData.namespace &&
    key === origData.key
  ) {
    edit.old.text(origData.old);
    return Promise.resolve();
  }

  return Translator.create(lang).getTranslation(namespace, key)
    .then((old) => {
      const editor = edit.value;
      if (!editor.val() || editor.val() === edit.old.text()) {
        editor.val(old);
      }

      edit.old.text(old);
    });
}

$([edit.language[0], edit.namespace[0]])
  .change(() => updateKeys().then(updateOld).catch(error));

edit.key.change(() => updateOld().catch(error));

$(document).ready(() => updateKeys().then(updateOld).catch(error));

interface TranslationsListResponse {
  translations: Translation[];
}

function removeTranslation(id: string): Promise<TranslationsListResponse> {
  return requestDelete('/api/admin/plugins/customize/delete/translation/', {
    translation: id,
  });
}

function updateList({ translations }: TranslationsListResponse): Promise<void> {
  window.ajaxify.data.translations = translations;
  edit.parent.data({
    template: null,
  });

  return Benchpress.render('partials/admin/plugins/customize/translations-list', {
    translations,
  })
    .then(html => Translator.create().translate(html))
    .then((html) => {
      list.html(html);
    });
}

function deleteEntry(elem: JQuery): Promise<void> {
  elem.addClass('active');

  return confirm('Are you sure you want to delete this translation?')
    .then((yes) => {
      if (!yes) {
        elem.removeClass('active');
        return Promise.resolve();
      }

      const elemId = elem.attr('id') as string;
      // skip past "translation--"
      const id = elemId.slice(13);
      return removeTranslation(id)
        .then(updateList)
        .then(success);
    });
}

list.on('click', '.delete', e => deleteEntry(
  $(e.target).closest('.translation')
).catch(error));

function editEntry(elem: JQuery): Promise<void> {
  elem.addClass('active');

  const translation = elem.data() as Translation;
  $('#translation-edit').data({
    translation,
  });

  $('#translation-edit-language').val(translation.language);
  $('#translation-edit-namespace').val(translation.namespace);

  return updateKeys()
    .then(() => {
      $('#translation-edit-key').val(translation.key);
      $('#translation-edit-original').text(translation.old);
      $('#translation-edit-value').val(translation.value);
    });
}

list.on('click', '.edit', e => editEntry(
  $(e.target).closest('.translation')
).catch(error));

function submit(): Promise<void> {
  const language = edit.language.val() as string | null;
  const namespace = edit.namespace.val() as string | null;
  const key = edit.key.val() as string | null;
  const old = edit.old.text() as string | null;
  const value = edit.value.val() as string | null;

  if (!language || !namespace || !key || !old || !value) {
    return Promise.resolve();
  }

  const oldData: Translation | null = edit.parent.data().translation;

  let before: Promise<TranslationsListResponse | void> = Promise.resolve();
  if (oldData && (
    oldData.language !== language ||
    oldData.namespace !== namespace ||
    oldData.key !== key
  )) {
    before = removeTranslation(`${oldData.language}:${oldData.namespace}:${oldData.key}`);
  }

  const data: Translation = {
    language,
    namespace,
    key,
    old,
    value,
  };

  return before
    .then(() => requestPost<{ translation: Translation }, TranslationsListResponse>(
      '/api/admin/plugins/customize/edit/translation',
      { translation: data }
    ))
    .then(updateList)
    .then(() => {
      edit.language.val(window.config.userLang);
      edit.namespace.val('');
      edit.key.val('');
      edit.old.text('');
      edit.value.val('');
      edit.parent.data({
        template: null,
      });
    });
}

edit.submit.click(() => submit().then(success, error));
