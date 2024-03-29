<div class="card">
  <div class="card-header">
    <h3 class="card-title">Translation Customizations</h3>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th>Language</th>
        <th>Namespace</th>
        <th>Key</th>
        <th>Original</th>
        <th>Replacement</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="translations-list">
      <!-- IMPORT partials/admin/plugins/customize/translations-list.tpl -->
    </tbody>
    <tfoot>
      <tr id="translation-edit" class="translation">
        <td>
          <select id="translation-edit-language">
            <option value="">---</option>
            {{{each languages}}}
            <option value="{./code}" {{{if ./selected}}}selected{{{end}}}>{./name} ({./code})</option>
            {{{end}}}
          </select>
        </td>
        <td>
          <select id="translation-edit-namespace">
            <option value="">---</option>
            {{{each namespaces}}}
            <option value="{./name}">{./name}</option>
            {{{end}}}
          </select>
        </td>
        <td>
          <select id="translation-edit-key">
            <!-- automatically fetch possible keys and autopopulate this -->
          </select>
        </td>
        <td>
          <span id="translation-edit-original"><!-- original goes here --></span>
        </td>
        <td>
          <!-- set to original value at first -->
          <textarea id="translation-edit-value"></textarea>
        </td>
        <td>
          <button class="btn btn-submit" id="translation-edit-submit"><i class="fa fa-fw fa-check"></i></button>
        </td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="card">
  <div class="card-header">
    <h3 class="card-title">Template Customizations</h3>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th>Template</th>
        <th>Diff</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="templates-list">
      <!-- IMPORT partials/admin/plugins/customize/templates-list.tpl -->
    </tbody>
    <tfoot>
      <tr id="template-edit" class="template">
        <td>
          <select id="template-edit-path">
            <option value="">---</option>
            {{{each templatePaths}}}
            <option value="{@value}">{@value}</option>
            {{{end}}}
          </select>
        </td>
        <td>
          <pre class="diff-preview"><code id="template-edit-diff"><!-- diff goes here --></code></pre>
        </td>
        <td>
          <button class="btn btn-primary" id="template-edit-open" data-bs-toggle="modal" data-bs-target="#template-edit-modal"><i class="fa fa-fw fa-pencil"></i></a>
          <button class="btn btn-success" id="template-edit-submit"><i class="fa fa-fw fa-check"></i></button>
        </td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="modal fade" id="template-edit-modal" tabindex="-1" role="dialog" aria-labelledby="template-edit-modal-label">
  <div class="modal-dialog modal-fullscreen" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title" id="template-edit-modal-label">Edit Template Customization</h4>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span></button>
      </div>
      <div class="modal-body row">
        <div class="col-md" id="template-edit-old"></div>
        <div class="col-md" id="template-edit-value"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Done</button>
      </div>
    </div>
  </div>
</div>

<button
  id="build"
  class="edit btn btn-primary position-fixed bottom-0 end-0 px-3 py-2 mb-4 me-4 rounded-circle fs-4"
  type="button" style="width: 64px; height: 64px;"
  title="[[admin/plugins/customize:build_description]]"
>
  <i class="fa fa-fw fas fa-hammer"></i>
</button>
