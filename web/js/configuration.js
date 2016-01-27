app.controller('ControllerConfiguration', [function() {

}]);

jQuery(document).ready(function() {

	jQuery('#navConfiguration').click(function() {

		jQuery('#modalConfiguration').modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});

		return false;

	});

});
