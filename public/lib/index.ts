// eslint-disable-next-line spaced-comment
/// <amd-module name="admin/plugins/customize"/>

import './translations';
import './templates';

$('#build').click(() => {
  Promise.resolve(
    $.post(`${window.config.relative_path}/api/admin/plugins/customize/build`)
  ).then(
    () => window.app.alertSuccess('[[admin/plugins/customize:build_success]]'),
    () => window.app.alertError()
  );
});
