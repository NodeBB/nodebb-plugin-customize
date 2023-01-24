// eslint-disable-next-line spaced-comment
/// <amd-module name="admin/plugins/customize"/>

import * as api from 'api';
import * as alerts from 'alerts';

import './translations';
import './templates';

$('#build').on('click', () => {
  api.put('/admin/plugins/customize/build', {}).then(
    () => alerts.success('[[admin/plugins/customize:build_success]]'),
    () => alerts.error()
  );
});
