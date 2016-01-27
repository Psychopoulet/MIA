app.controller('ControllerCrons', [function() {

}]);

jQuery(document).ready(function() {

	jQuery('#navCrons').click(function() {

		jQuery('#modalCrons').modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});

		return false;

	});

});
