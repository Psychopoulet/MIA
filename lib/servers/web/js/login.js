app.controller('ControllerLogin', ['$scope', '$http', '$popup', '$cookies', function($scope, $http, $popup, $cookies) {

	"use strict";

	function _APIErrorParser(err) {

		var result = "";

			if (!err || !err.data) {
				result = "Erreur non documentée par l'API";
			}
			else {

				result = ("string" === typeof err.data) ? err.data : "";

				if (err.data instanceof Array) {

					for (var i = 0; i < err.data.length; ++i) {

						if (err.data[i].message) {

							if ("" != result) { result += "\r\n" }
							result += "- " + err.data[i].message

						}

					}

				}
				
			}

		return result;
			
	}

	// attrs

	$scope.inProgress = false;

	// events

	socket.on('disconnect', function () {

		$scope.$apply(function() {
			
			$scope.inProgress = false;

			jQuery('.only-logged, .only-connected').addClass('hidden-xs-up');
			jQuery('.only-disconnected').removeClass('hidden-xs-up');

		});

	}).on('connect', function() {

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

				if (!token) {
					jQuery("#login_login").focus();
				}
				else {

					$scope.inProgress = true;

					$http.post("/api/users/login", {
						token : token
					}).then(function() {

						jQuery('.only-disconnected, .only-connected').addClass('hidden-xs-up');
						jQuery('.only-logged').removeClass('hidden-xs-up');

					}).catch(function(err) {

						$popup.alert({
							title: "Login par token",
							message: _APIErrorParser(err).replace("\r\n", "<br />"),
							type: "danger"
						});

					}).finally(function() {

						$scope.inProgress = false;

					});

				}

		});

	})
	
	// interface

	$scope.log = function() {

		$scope.inProgress = true;

		$http.post("/api/users/login", {
			login : $scope.login,
			password : $scope.password
		}).then(function() {

			if (localStorage) {
				localStorage.setItem('token', client.token);
			}
			else {
				$cookies.put('token', client.token);
			}

			jQuery('.only-disconnected, .only-connected').addClass('hidden-xs-up');
			jQuery('.only-logged').removeClass('hidden-xs-up');

		}).catch(function(err) {

			$popup.alert({
				title: "Login",
				message: _APIErrorParser(err).replace("\r\n", "<br />"),
				type: "danger"
			});

		}).finally(function() {

			$scope.inProgress = false;

		});

	};

}]);
