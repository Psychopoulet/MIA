app.service('$actions', function() {

	var _tabOnErrors = [], that = this;

	function _fireError(msg) {

		angular.forEach(_tabOnErrors, function(callback) {
			callback(msg);
		});

	}

	this.add = function(name, child, action, params) {

		if (!name) {
			_fireError("'name' manquant");
		}
		else if (!child) {
			_fireError("'child' manquant");
		}
			else if (!child.token) {
				_fireError("'child.token' manquant");
			}
		else if (!action) {
			_fireError("'action' manquant");
		}
		else if (!params) {
			_fireError("'params' manquant");
		}
		else {

			socket.emit('action.add', {
				name : name, child : child, action : action, params : params
			});

		}

		return that;

	};

	socket.on('action.add.error', _fireError);

	this.onAddError = function(callback) {

		if ('function' === typeof callback) {
			_tabOnErrors.push(callback);
		}

		return that;

	};

});

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
