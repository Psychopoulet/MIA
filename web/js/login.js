app.controller('ControllerLogin', ['$scope', '$popup', '$cookies', function($scope, $popup, $cookies) {

	"use strict";

	// attrs

	$scope.inProgress = false;

	// events

	socket.on('connect', function() {

		$scope.$apply(function() {
			
			var token = '';

			jQuery('.only-disconnected, .only-logged').addClass('hidden-xs-up');
			jQuery('.only-connected').removeClass('hidden-xs-up');

			// check token

				if (localStorage) {
					token = localStorage.getItem('token');
				}
				if (!token) {

					token = $cookies.get('token');

					if (token) {
						$cookies.put('token', token);
					}

				}

				if (token) {

					$scope.inProgress = true;

					socket.emit('login', {
						token : token
					});

				}

		});

	})
	.on('disconnect', function () {

		$scope.$apply(function() {
			
			$scope.inProgress = false;

			jQuery('.only-logged, .only-connected').addClass('hidden-xs-up');
			jQuery('.only-disconnected').removeClass('hidden-xs-up');

		});

	})
	
	.on('logged', function (client) {

		$scope.$apply(function() {
			
			$scope.inProgress = false;

			if (localStorage) {
				localStorage.setItem('token', client.token);
			}
			else {
				$cookies.put('token', client.token);
			}

			jQuery('.only-disconnected, .only-connected').addClass('hidden-xs-up');
			jQuery('.only-logged').removeClass('hidden-xs-up');

		});

	})
	.on('client.deleted', function (err) {

		$scope.$apply(function() {

			$scope.inProgress = false;

			if (localStorage) {
				localStorage.removeItem('token');
			}
			else {
				$cookies.remove('token');
			}
		
			jQuery('.only-connected, .only-logged').addClass('hidden-xs-up');
			jQuery('.only-disconnected').removeClass('hidden-xs-up');

		});

	})
	.on('login.error', function (err) {

		$scope.$apply(function() {
			
			$scope.inProgress = false;
			$popup.alert(err);

		});

	});

	// interface

	$scope.log = function() {

		$scope.inProgress = true;

		socket.emit('login', {
			login : $scope.login,
			password : $scope.password
		});

		return false;

	};

}]);
