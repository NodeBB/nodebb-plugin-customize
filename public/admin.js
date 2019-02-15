define('admin/plugins/customize', [], function () {
  $('#build').on('click', function () {
    $.get(window.config.relative_path + '/api/admin/plugins/emoji/build', function () {
      window.app.alertSuccess('[[admin/plugins/customize:build_success]]');
    });
  });
});
