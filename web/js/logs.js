app.controller('ControllerLogs', ['$scope', '$popup', function($scope, $popup) {

	$scope.logs = [];

	socket.on('logged', function() {
		socket.emit('logs');
	})
	.on('logs', function(logs) {
        $scope.$apply(function () { $scope.logs = logs; });
	})
	.on('log', function(content) {
        
		$popup.alert({
			title: 'Log',
			message: content,
			size: 'large',
			maxheight: 500
		});

	})
	.on('logs.error', function(err) {

		$popup.alert({
			title: "Logs",
			message: (err.message) ? err.message : err,
			type: "danger"
		});

	});

	$scope.seeLog = function(year, month, day) {

		socket.emit('log', {
			year: year,
			month: month,
			day: day
		});

	};

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
