app.controller('ControllerLogin', ['$scope', '$http', '$popup', '$cookies', function($scope, $http, $popup, $cookies) {

	"use strict";

	function _APIErrorToHTML(err) {

		var result = "";

			if (!err || !err.data) {
				result = "Erreur non documentée par l'API";
			}
			else {

				result = ("string" === typeof err.data) ? err.data : "";

				if (err.data.errors && err.data.errors instanceof Array) {

					var tresult = [];
					for (var i = 0; i < err.data.errors.length; ++i) {

						if (err.data.errors[i].message) {
							tresult.push(err.data.errors[i].message);
						}

					}

					for (var i = 0; i < tresult.length; ++i) {

						if (0 < i || (0 == i && 1 < tresult.length)) {
							result += "- " + tresult[i];
						}
						else {
							result += tresult[i];
						}

						if (i < tresult.length - 1) {
							result += "<br />";
						}

					}

				}
				
			}

			if (!result) {
				result = "Impossible de lire l'erreur générée par l'API";
			}

		return result;
			
	}

	function _hide() {
		jQuery('.only-disconnected, .only-connected, .only-validation, .only-validated').addClass('hidden-xs-up');
	}

	function _validateToken() {

		var token = '';

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

			_hide();
			jQuery('.only-connected').removeClass('hidden-xs-up');

			jQuery("#login_login").focus();

		}
		else {

			_hide();
			jQuery('.only-validation').removeClass('hidden-xs-up');

			$scope.inProgress = true;

			$http.post("/api/devices/check", {
				token : token
			}).then(function() {

				_hide();
				jQuery('.only-validated').removeClass('hidden-xs-up');

			}).catch(function(err) {

				if (err.data && err.data.status && 401 == err.data.status) {

					if (localStorage) {
						localStorage.removeItem('token');
					}
					else {
						$cookies.remove('token');
					}

					_validateToken();

				}
				else {

					$popup.alert({
						title: "Validation du token",
						message: _APIErrorToHTML(err),
						type: "danger"
					});
					
				}

			}).finally(function() {

				$scope.inProgress = false;

			});

		}

	}

	// attrs

	$scope.inProgress = false;

	// events

	socket.on('disconnect', function () {

		$scope.$apply(function() {
			
			$scope.inProgress = false;

			_hide();
			jQuery('.only-disconnected').removeClass('hidden-xs-up');

		});

	}).on('connect', function() {
		$scope.$apply(_validateToken);
	})
	
	// interface

	$scope.log = function() {

		$scope.inProgress = true;

		$http.post("/api/users/login", {
			login : $scope.login,
			password : $scope.password
		}).then(function(res) {

			if (localStorage) {
				localStorage.setItem('token', res.data.token);
			}
			else {
				$cookies.put('token', res.data.token);
			}

			_hide();
			jQuery('.only-validation').removeClass('hidden-xs-up');

			_validateToken();

		}).catch(function(err) {

			$popup.alert({
				title: "Login",
				message: _APIErrorToHTML(err),
				type: "danger"
			});

		}).finally(function() {

			$scope.inProgress = false;

		});

	};

}]);
