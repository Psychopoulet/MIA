app.controller('ControllerLogs', ['$scope', '$popup', function($scope, $popup) {

	$scope.logs = [];

	socket.on('logged', function() {
		socket.emit('logs');
	})
	.on('logs', function(logs) {
        $scope.$apply(function () { $scope.logs = logs; });
	})
	.on('logs.error', function(err) {

		$popup.alert({
			title: "Logs",
			message: (err.message) ? err.message : err,
			type: "danger"
		});

	});

}]);

jQuery(document).ready(function() {

	jQuery('#navLogs').click(function() {

		jQuery('#modalLogs').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

		return false;

	});

});
