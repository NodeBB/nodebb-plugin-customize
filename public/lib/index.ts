// eslint-disable-next-line spaced-comment
/// <amd-module name="admin/plugins/customize"/>

import * as api from 'api';

import './translations';
import './templates';

$('#build').click(() => {
  api.put('/admin/plugins/customize/build', {}).then(
    () => window.app.alertSuccess('[[admin/plugins/customize:build_success]]'),
    () => window.app.alertError()
  );
});
