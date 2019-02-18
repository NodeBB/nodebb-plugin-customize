{{{each translations}}}
<tr
  class="translation"
  id="translation--{./language}:{./namespace}:{./key}"
  data-language="{./language}"
  data-namespace="{./namespace}"
  data-key="{./key}"
  data-old="{escape(./old)}"
  data-value="{escape(./value)}"
>
  <td>{./language}</td>
  <td>{./namespace}</td>
  <td>{./key}</td>
  <td>{escape(./old)}</td>
  <td>{escape(./value)}</td>
  <td>
    <button class="btn btn-link edit"><i class="fa fa-fw fa-pencil"></i></a>
    <button class="btn btn-link delete"><i class="fa fa-fw fa-trash text-danger"></i></a>
  </td>
</tr>
{{{end}}}
