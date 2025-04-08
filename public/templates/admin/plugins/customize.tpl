<div class="acp-page-container" style="max-width: 1200px;">
	<div component="settings/main/header" class="row border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center">
		<div class="col-12 col-md-8 px-0 mb-1 mb-md-0">
			<h4 class="fw-bold tracking-tight mb-0">{title}</h4>
		</div>
		<div class="col-12 col-md-4 px-0 px-md-3">
			<button id="build" class="btn btn-primary btn-sm fw-semibold ff-secondary w-100 text-center text-nowrap">[[admin/admin:save-changes]]</button>
		</div>
	</div>

	<div class="row m-0">
		<div id="spy-container" class="col-12 px-0 mb-4" tabindex="0">
			<div class="card">
				<div class="card-header">
					<h4 class="card-title">Translation Customizations</h4>
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
						<select id="translation-edit-language" class="form-select">
						<option value="">---</option>
						{{{each languages}}}
						<option value="{./code}" {{{if ./selected}}}selected{{{end}}}>{./name} ({./code})</option>
						{{{end}}}
						</select>
					</td>
					<td>
						<select id="translation-edit-namespace" class="form-select">
						<option value="">---</option>
						{{{each namespaces}}}
						<option value="{./name}">{./name}</option>
						{{{end}}}
						</select>
					</td>
					<td>
						<select id="translation-edit-key" class="form-select">
						<!-- automatically fetch possible keys and autopopulate this -->
						</select>
					</td>
					<td>
						<span id="translation-edit-original"><!-- original goes here --></span>
					</td>
					<td>
						<!-- set to original value at first -->
						<textarea id="translation-edit-value" class="form-control"></textarea>
					</td>
					<td>
						<button class="btn btn-ghost" id="translation-edit-submit"><i class="fa fa-fw fa-check text-success"></i></button>
					</td>
					</tr>
				</tfoot>
				</table>
			</div>

			<div class="card">
			<div class="card-header">
				<h4 class="card-title">Template Customizations</h4>
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
					<select id="template-edit-path" class="form-select">
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
					<div class="d-flex gap-2">
						<button class="btn btn-sm btn-primary" id="template-edit-open" data-bs-toggle="modal" data-bs-target="#template-edit-modal"><i class="fa fa-fw fa-pencil"></i></a>
						<button class="btn btn-sm btn-success" id="template-edit-submit"><i class="fa fa-fw fa-check"></i></button>
					</div>
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
		</div>
	</div>
</div>





