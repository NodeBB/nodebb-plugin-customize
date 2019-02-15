import { Translator } from 'translator';
import * as Benchpress from 'benchpress';

function post(url: string, data: any): Promise<any> {
  return Promise.resolve($.ajax({
    method: 'POST',
    url: `${window.config.relative_path}${url}`,
    data: JSON.stringify(data),
    processData: false,
    contentType: 'application/json',
  }));
}

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

  return Translator.create(lang).getTranslation(namespace).then((translationMap) => {
    const keys = Object.keys(translationMap).map(key => ({
      value: key,
      text: key,
    }));
    setOptions(elem, keys);
    elem.prepend('<option value="">---</option>');
  });
}

function updateOld(): void {
  const row = $('#translation-edit');
  const origData: Translation | null = row.data().translation;

  const lang = $('#translation-edit-language').val() as string;
  const namespace = $('#translation-edit-namespace').val() as string | null;
  const key = $('#translation-edit-key').val() as string | null;

  if (!namespace || !key) {
    return;
  }

  if (
    origData &&
    lang === origData.language &&
    namespace === origData.namespace &&
    key === origData.key
  ) {
    $('#translation-edit-original').text(origData.old);
    return;
  }

  Translator.create(lang).getTranslation(namespace, key).then((old) => {
    const editor = $('#translation-edit-value');
    if (!editor.val() || editor.val() === $('#translation-edit-original').text()) {
      editor.val(old);
    }

    $('#translation-edit-original').text(old);
  });
}

$('#translation-edit-language, #translation-edit-namespace')
  .change(() => { updateKeys().then(updateOld); });

$('#translation-edit-key')
  .change(() => updateOld());

$(document).ready(() => { updateKeys().then(updateOld); });

function requestDelete(id: string): Promise<{
  translations: Translation[];
}> {
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

function updateList({ translations }: { translations: Translation[] }): Promise<void> {
  window.ajaxify.data.translations = translations;

  return Benchpress.render('partials/admin/plugins/customize/translations-list', {
    translations,
  })
    .then(html => Translator.create().translate(html))
    .then((html) => {
      $('#translations-list').html(html);
    });
}

function deleteEntry(elem: JQuery): void {
  elem.addClass('active');

  window.bootbox.confirm('Are you sure you want to delete this translation?', (yes) => {
    if (!yes) {
      elem.removeClass('active');
      return;
    }

    const elemId = elem.attr('id') as string;
    // skip past "translation--"
    const id = elemId.slice(13);
    requestDelete(id)
      .then(updateList)
      .then(() => window.app.alertSuccess(), () => window.app.alertError());
  });
}

$('#translations-list')
  .on('click', '.delete', e => deleteEntry(
    $(e.target).closest('.translation')
  ));

function editEntry(elem: JQuery): void {
  elem.addClass('active');

  const translation = elem.data() as Translation;
  $('#translation-edit').data({
    translation,
  });

  $('#translation-edit-language').val(translation.language);
  $('#translation-edit-namespace').val(translation.namespace);

  updateKeys().then(() => {
    $('#translation-edit-key').val(translation.key);
    $('#translation-edit-original').text(translation.old);
    $('#translation-edit-value').val(translation.value);
  });
}

$('#translations-list')
  .on('click', '.edit', e => editEntry(
    $(e.target).closest('.translation')
  ));

function submit(): void {
  const language = $('#translation-edit-language').val() as string | null;
  const namespace = $('#translation-edit-namespace').val() as string | null;
  const key = $('#translation-edit-key').val() as string | null;
  const old = $('#translation-edit-original').text() as string | null;
  const value = $('#translation-edit-value').val() as string | null;

  if (!language || !namespace || !key || !old || !value) { return; }

  const oldData: Translation | null = $('#translation-edit').data().translation;

  let before: Promise<any> = Promise.resolve();
  if (
    oldData && (
      oldData.language !== language ||
      oldData.namespace !== namespace ||
      oldData.key !== key
    )
  ) {
    before = requestDelete(`${oldData.language}:${oldData.namespace}:${oldData.key}`);
  }

  const data: Translation = {
    language,
    namespace,
    key,
    old,
    value,
  };

  before
    .then(() => post('/api/admin/plugins/customize/edit/translation', {
      translation: data,
    }))
    .then(updateList)
    .then(() => window.app.alertSuccess(), () => window.app.alertError());

  $('#translation-edit-language').val(window.config.userLang);
  $('#translation-edit-namespace').val('');
  $('#translation-edit-key').val('');
  $('#translation-edit-original').text('');
  $('#translation-edit-value').val('');
}

$('#translation-edit-submit').click(submit);
