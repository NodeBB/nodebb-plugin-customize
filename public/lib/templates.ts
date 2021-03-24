import { Translator } from 'translator';
import * as Benchpress from 'benchpress';
import * as ace from 'ace/ace';
import * as api from 'api';

import {
  success,
  error,
  confirm,
} from './shared';

const edit = {
  parent: $('#template-edit'),
  path: $('#template-edit-path'),
  diff: $('#template-edit-diff'),
  old: $('#template-edit-old'),
  value: $('#template-edit-value'),
  open: $('#template-edit-open'),
  modal: $('#template-edit-modal'),
  submit: $('#template-edit-submit'),
};

const list = $('#templates-list');

const oldEditor = ace.edit('template-edit-old');
oldEditor.setTheme('ace/theme/twilight');
oldEditor.setReadOnly(true);
const oldEditorSession = oldEditor.getSession();
oldEditorSession.setMode('ace/mode/html');

const valueEditor = ace.edit('template-edit-value');
valueEditor.setTheme('ace/theme/twilight');
const valueEditorSession = valueEditor.getSession();
valueEditorSession.setMode('ace/mode/html');

oldEditorSession.on('changeScrollTop', (scroll) => {
  valueEditorSession.setScrollTop(parseInt(scroll, 10) || 0);
});
oldEditorSession.on('changeScrollLeft', (scroll) => {
  valueEditorSession.setScrollLeft(parseInt(scroll, 10) || 0);
});

valueEditorSession.on('changeScrollTop', (scroll) => {
  oldEditorSession.setScrollTop(parseInt(scroll, 10) || 0);
});
valueEditorSession.on('changeScrollLeft', (scroll) => {
  oldEditorSession.setScrollLeft(parseInt(scroll, 10) || 0);
});

edit.path.change(() => {
  edit.diff.text('');

  const path = edit.path.val() as string | null;
  const oldData = edit.parent.data().template as Template | null;

  edit.open.prop('disabled', true);
  edit.submit.prop('disabled', true);

  if (path) {
    if (oldData && oldData.path === path) {
      edit.open.prop('disabled', false);
      edit.submit.prop('disabled', false);

      return;
    }

    // get old template value
    Promise.resolve(
      $.get(`${window.config.relative_path}/assets/templates/${path}`)
    )
      .then((old) => {
        edit.parent.data({
          template: {
            old,
          },
        });

        edit.open.prop('disabled', false);
        edit.submit.prop('disabled', false);
      })
      .catch(error);
  }
});

interface TemplatesListResponse {
  templates: Template[];
}

function removeTemplate(path: string): Promise<TemplatesListResponse> {
  return api.del('/admin/plugins/customize/delete/template', {
    template: path,
  });
}

function updateList({ templates }: TemplatesListResponse): Promise<void> {
  window.ajaxify.data.templates = templates;

  return Benchpress.render('partials/admin/plugins/customize/templates-list', {
    templates,
  })
    .then((html) => Translator.create().translate(html))
    .then((html) => { list.html(html); });
}

function deleteEntry(elem: JQuery): Promise<void> {
  elem.addClass('active');

  return confirm('Are you sure you want to delete this template?')
    .then((yes) => {
      if (!yes) {
        elem.removeClass('active');
        return Promise.resolve();
      }

      const id = elem.attr('data-path') as string;
      return removeTemplate(id)
        .then(updateList)
        .then(success);
    });
}

list.on('click', '.delete', (e) => deleteEntry(
  $(e.target).closest('.template')
).catch(error));

function editEntry(elem: JQuery): void {
  elem.addClass('active');

  const template = JSON.parse(Translator.unescape(elem.attr('data-json') as string)) as Template;

  edit.parent.data({
    template: {
      path: template.path,
      diff: template.diff,
      old: template.old,
      value: template.value,
    },
  });

  edit.path.val(template.path);
  edit.diff.text(template.diff);
}

list.on('click', '.edit', (e) => editEntry(
  $(e.target).closest('.template')
));

edit.open.click(() => {
  const oldData: Template | null = edit.parent.data().template;

  if (oldData && oldData.old) {
    oldEditor.setValue(oldData.old);
    valueEditor.setValue(oldData.value || oldData.old);
  }
});

edit.modal.on('hide.bs.modal', () => {
  import('diff').then((Diff) => {
    const old = oldEditor.getValue();
    const value = valueEditor.getValue();

    const oldName = edit.path.val() as string;
    const valueName = `custom ${oldName}`;

    const patch = Diff.createTwoFilesPatch(oldName, valueName, old, value);
    edit.diff.text(patch);
  });
});

function submit(): Promise<void> {
  const path = edit.path.val() as string | null;
  const diff = edit.diff.text() as string | null;
  const old = oldEditor.getValue();
  const value = valueEditor.getValue();

  if (!path || !diff || !old || !value) {
    return Promise.resolve();
  }

  const oldData: Template | null = edit.parent.data().template;

  let before: Promise<TemplatesListResponse | void> = Promise.resolve();
  if (oldData && (
    oldData.path !== path
  )) {
    before = removeTemplate(oldData.path);
  }

  const data: Template = {
    path,
    diff,
    old,
    value,
  };

  return before
    .then(() => api.put('/admin/plugins/customize/edit/template', {
      template: data,
    }))
    .then(updateList)
    .then(() => {
      edit.path.val('');
      edit.diff.text('');
      edit.parent.data({
        template: null,
      });
    });
}

edit.submit.click(() => submit().then(success, error));
