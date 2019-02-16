import { Translator } from 'translator';
import * as Benchpress from 'benchpress';

const success = (): void => window.app.alertSuccess();
const error = (err: Error): void => {
  window.app.alertError(err);
  setTimeout(() => { throw err; }, 0);
};

function setOptions(select: JQuery, options: {
  value: string;
  text: string;
}[]): void {
  select.empty();

  options.forEach(({ value, text }) => {
    $('<option>')
      .attr({ value })
      .text(text)
      .appendTo(select);
  });
}

function updateKeys(): Promise<void> {
  const lang = $('#translation-edit-language').val() as string;
  const namespace = $('#translation-edit-namespace').val() as string | null;
  const elem = $('#translation-edit-key');

  if (!namespace) {
    return Promise.resolve();
  }

  return Translator.create(lang).getTranslation(namespace)
    .then((translationMap) => {
      const keys = Object.keys(translationMap).map(key => ({
        value: key,
        text: key,
      }));
      setOptions(elem, keys);
      elem.prepend('<option value="">---</option>');
    });
}

function updateOld(): Promise<void> {
  const row = $('#translation-edit');
  const origData: Translation | null = row.data().translation;

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
    $('#translation-edit-original').text(origData.old);
    return Promise.resolve();
  }

  return Translator.create(lang).getTranslation(namespace, key)
    .then((old) => {
      const editor = $('#translation-edit-value');
      if (!editor.val() || editor.val() === $('#translation-edit-original').text()) {
        editor.val(old);
      }

      $('#translation-edit-original').text(old);
    });
}

$('#translation-edit-language, #translation-edit-namespace')
  .change(() => updateKeys().then(updateOld).catch(error));

$('#translation-edit-key')
  .change(() => updateOld().catch(error));

$(document).ready(() => updateKeys().then(updateOld).catch(error));

interface TranslationsListResponse {
  translations: Translation[];
}

function requestDelete(id: string): Promise<TranslationsListResponse> {
  return Promise.resolve($.ajax({
    method: 'DELETE',
    url: `${window.config.relative_path}/api/admin/plugins/customize/delete/translation/`,
    data: JSON.stringify({
      translation: id,
    }),
    processData: false,
    contentType: 'application/json',
  }));
}

function updateList({ translations }: TranslationsListResponse): Promise<void> {
  window.ajaxify.data.translations = translations;

  return Benchpress.render('partials/admin/plugins/customize/translations-list', {
    translations,
  })
    .then(html => Translator.create().translate(html))
    .then((html) => {
      $('#translations-list').html(html);
    });
}

function confirm(message: string): Promise<boolean> {
  return new Promise(
    resolve => window.bootbox.confirm(message, resolve)
  );
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
      return requestDelete(id)
        .then(updateList)
        .then(success);
    });
}

$('#translations-list')
  .on('click', '.delete', e => deleteEntry(
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

$('#translations-list')
  .on('click', '.edit', e => editEntry(
    $(e.target).closest('.translation')
  ).catch(error));

function submit(): Promise<void> {
  const language = $('#translation-edit-language').val() as string | null;
  const namespace = $('#translation-edit-namespace').val() as string | null;
  const key = $('#translation-edit-key').val() as string | null;
  const old = $('#translation-edit-original').text() as string | null;
  const value = $('#translation-edit-value').val() as string | null;

  if (!language || !namespace || !key || !old || !value) {
    return Promise.resolve();
  }

  const oldData: Translation | null = $('#translation-edit').data().translation;

  let before: Promise<TranslationsListResponse | void> = Promise.resolve();
  if (oldData && (
    oldData.language !== language ||
    oldData.namespace !== namespace ||
    oldData.key !== key
  )) {
    before = requestDelete(`${oldData.language}:${oldData.namespace}:${oldData.key}`);
  }

  const data: Translation = {
    language,
    namespace,
    key,
    old,
    value,
  };

  return before
    .then(() => $.ajax({
      method: 'POST',
      url: `${window.config.relative_path}/api/admin/plugins/customize/edit/translation`,
      data: JSON.stringify({ translation: data }),
      processData: false,
      contentType: 'application/json',
    }))
    .then(updateList)
    .then(() => {
      $('#translation-edit-language').val(window.config.userLang);
      $('#translation-edit-namespace').val('');
      $('#translation-edit-key').val('');
      $('#translation-edit-original').text('');
      $('#translation-edit-value').val('');
    });
}

$('#translation-edit-submit').click(() => submit().then(success, error));
