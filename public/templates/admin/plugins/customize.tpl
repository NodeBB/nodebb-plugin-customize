<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Translation Customizations</h3>
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

<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Template Customizations</h3>
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
          <pre><code id="template-edit-diff"><!-- diff goes here --></code></pre>
        </td>
        <td>
          <button class="btn btn-primary" id="template-edit-open" data-toggle="modal" data-target="#template-edit-modal"><i class="fa fa-fw fa-pencil"></i></a>
          <button class="btn btn-success" id="template-edit-submit"><i class="fa fa-fw fa-check"></i></button>
        </td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="modal fade" id="template-edit-modal" tabindex="-1" role="dialog" aria-labelledby="template-edit-modal-label">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="template-edit-modal-label">Edit Template Customization</h4>
      </div>
      <div class="modal-body row">
        <div id="template-edit-old"></div>
        <div id="template-edit-value"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Done</button>
      </div>
    </div>
  </div>
</div>

<button
  id="build"
  class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"
  title="[[admin/plugins/customize:build_description]]"
>
	<i class="material-icons">build</i>
</button>
