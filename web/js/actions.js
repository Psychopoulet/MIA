app.service('$actions', ['$q', function($q) {

	this.add = function(name, child, command, params) {

		var deferred = $q.defer(), data;

			if (!name) {
				deferred.reject("Le nom de l'action est manquant.");
			}
			else if (!child) {
				deferred.reject("L'enfant conserné par l'action est manquant.");
			}
				else if (!child.token) {
					deferred.reject("L'enfant conserné par l'action n'a pas de token.");
				}
			else if (!command) {
				deferred.reject("La commande consernée par l'action est manquante.");
			}
			else {

				data = {
					name : name, child : child, command : command
				};

				if (params) {
					data.params = params;
				}

				console.log('action.add');
				console.log(data);

				socket.emit('action.add', data);

				deferred.resolve();

			}

		return deferred.promise;

	};

}]);

app.controller('ControllerAction', ['$scope', '$popup', '$actions', function($scope, $popup, $actions) {

	$scope.actions = [];

	socket.on('logged', function() {
		socket.emit('actions');
	})
	.on('actions', function(actions) {
		$scope.actions = actions;
		$scope.$apply();
	})
	.on('actions.error', $popup.alert);

	$scope.execute = function(action) {
		socket.emit('action.execute', action);
	};

	$scope.delete = function(action) {

		$popup.confirm({
			message : "Voulez-vous vraiment supprimer l'action' '" + action.name + "' ?",
			onyes : function() {
				socket.emit('action.delete', action);
			}
		});

	};

}]);

app.controller('ControllerActions', ['$scope', '$popup', '$actions', function($scope, $popup, $actions) {

	$scope.actions = [];

	socket.on('logged', function() {
		socket.emit('actions');
	})
	.on('actions', function(actions) {
		$scope.actions = actions;
		$scope.$apply();
	})
	.on('actions.error', $popup.alert);

	$scope.execute = function(action) {
		socket.emit('action.execute', action);
	};

	$scope.delete = function(action) {

		$popup.confirm({
			message : "Voulez-vous vraiment supprimer l'action' '" + action.name + "' ?",
			onyes : function() {
				socket.emit('action.delete', action);
			}
		});

	};

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
