{{{each templates}}}
<tr
  class="template"
  id="template--{./path}"
  data-path="{./path}"
  data-json="{./json}"
>
  <td>{./path}</td>
  <td><pre><code>{./diff}</code></pre></td>
  <td>
    <button class="btn btn-link edit"><i class="fa fa-fw fa-cog"></i></a>
    <button class="btn btn-link delete"><i class="fa fa-fw fa-trash text-danger"></i></a>
  </td>
</tr>
{{{end}}}
