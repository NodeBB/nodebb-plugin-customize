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
      <tr
        id="translation-edit"
        class="translation"
      >
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
          <button class="btn btn-primary" id="translation-edit-submit"><i class="fa fa-fw fa-check"></i></button>
        </td>
      </tr>
    </tfoot>
  </table>
</div>

<button id="build" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" title="[[admin/plugins/customize:build_description]]">
	<i class="material-icons">build</i>
</button>
