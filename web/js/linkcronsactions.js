app.controller('ControllerLinkCronsActions', ['$scope', '$popup', function($scope, $popup) {

	$scope.cron = null;
	$scope.crons = [];

	$scope.action = null;
	$scope.actions = [];

	$scope.cronsactions = [];

	$scope.selectCron = function(cron) {

		if ($scope.cron == cron) {
			$scope.cron = null;
		}
		else {
			$scope.cron = cron;
		}

		return false;
		
	};

	$scope.selectAction = function(action) {

		if ($scope.action == action) {
			$scope.action = null;
		}
		else {
			$scope.action = action;
		}
		
		return false;
		
	};

	$scope.link = function(cron, action) {
		socket.emit('cronaction.link', { cron: cron, action: action });
	};

	$scope.unlink = function(cron, action) {
		socket.emit('cronaction.unlink', { cron: cron, action: action });
	};

	$scope.linked = function(cron, action) {

		var result = false;

			for (var i = 0; i < $scope.cronsactions.length; ++i) {

				if ($scope.cronsactions[i].cron.id == cron.id && $scope.cronsactions[i].action.id == action.id) {
					result = true;
					break;
				}

			}

		return result;
	};

	socket.on('logged', function() {
		socket.emit('cronsactions');
	})
	.on('crons', function(crons) {
		$scope.crons = crons;
		$scope.$apply();
	})
	.on('actions', function(actions) {
		$scope.actions = actions;
		$scope.$apply();
	})
	.on('cronsactions', function(cronsactions) {
		$scope.cronsactions = cronsactions;
		$scope.$apply();
	})
	.on('cronsactions.error', $popup.alert);

}]);
