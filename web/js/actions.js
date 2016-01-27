app.controller('ControllerActions', [function() {

}]);

jQuery(document).ready(function() {

	jQuery('#navActions').click(function() {

		jQuery('#modalActions').modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});

		return false;

	});

});
