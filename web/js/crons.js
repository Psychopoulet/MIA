app.controller('ControllerCrons', ['$scope', '$popup', function($scope, $popup) {

	$scope.crons = {};

	socket.on('logged', function() {
		socket.emit('crons');
	})
	.on('crons', function(crons) {
		$scope.crons = crons;
		$scope.$apply();
	})
	.on('crons.error', $popup.alert);

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
