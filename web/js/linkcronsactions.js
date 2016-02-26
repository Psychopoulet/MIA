app.controller('ControllerLinkCronsActions', ['$scope', '$popup', function($scope, $popup) {

	$scope.cron = null;
	$scope.crons = [];

	$scope.action = null;
	$scope.actions = [];

	socket.on('crons', function(crons) {
		$scope.crons = crons;
		$scope.$apply();
	})
	.on('actions', function(actions) {
		$scope.actions = actions;
		$scope.$apply();
	});

	$scope.selectCron = function(cron) {
		$scope.cron = cron;
	};

	$scope.selectAction = function(action) {
		$scope.action = action;
	};

}]);
