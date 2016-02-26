app.controller('ControllerLinkCronsActions', ['$scope', '$popup', function($scope, $popup) {

	$scope.crons = [];
	$scope.actions = [];

	socket.on('crons', function(crons) {
		$scope.crons = crons;
		$scope.$apply();
	})
	.on('actions', function(actions) {
		$scope.actions = actions;
		$scope.$apply();
	});

}]);
