app.controller('ControllerPlugins', [function() {

}]);

jQuery(document).ready(function() {

	jQuery('#navPlugins').click(function() {

		jQuery('#modalPlugins').modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});

		return false;

	});

});
