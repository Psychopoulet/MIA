app.controller('ControllerLogin', ['$scope', '$http', '$popup', '$cookies', function($scope, $http, $popup, $cookies) {

	"use strict";

	// private

		// attrs

			var _firstCheckedConnection = true;

		// methods

			function _setStatus(status) {

				jQuery('.only-disconnected, .only-connected, .only-validation, .only-validated').addClass('hidden-xs-up');
				jQuery('.only-' + status).removeClass('hidden-xs-up');

				switch(status) {

					case "connected":
						jQuery("#login_login").focus();
					break;

				}

			}

			// token

				getToken = function () {

					var result = '';

						if (localStorage) {
							result = localStorage.getItem('token');
						}
						if (!result) {
							result = $cookies.get('token');
						}

					return result;

				};

				function _setToken(token) {

					if (localStorage) {
						localStorage.setItem('token', token);
					}
					else {
						$cookies.put('token', token);
					}

				}

				function  _deleteToken() {

					if (localStorage) {
						localStorage.removeItem('token');
					}
					else {
						$cookies.remove('token');
					}

				}

	// public

		// attrs

			$scope.inProgress = false;

		// interface

			$scope.log = function() {

				if (!getToken()) {

					$popup.alert({
						title: "La création du périphérique a échouée. Veuillez raffraichir votre navigateur.",
						message: APIErrorToHTML(err),
						type: "danger"
					});
							
				}
				else {

					$scope.inProgress = true;

					$http.post("/api/users/login", {
						token: getToken(),
						login : $scope.login,
						password : $scope.password
					}).then(function(res) {

						_setToken(res.data.token);
						_setStatus("validation");

						$scope.inProgress = true;

						$http.post("/api/devices/check", {
							token : res.data.token
						}).then(function() {
							socket.emit('device.check', res.data.token);
						}).catch(function(err) {

							if (err.data && err.data.status && 401 == err.data.status) {
								_deleteToken();
								_setStatus("connected");
							}
							else {

								$popup.alert({
									title: "Validation du token",
									message: APIErrorToHTML(err),
									type: "danger"
								});
								
							}

						}).finally(function() {

							$scope.inProgress = false;

						});

					}).catch(function(err) {

						$popup.alert({
							title: "Login",
							message: APIErrorToHTML(err),
							type: "danger"
						});

					}).finally(function() {

						$scope.inProgress = false;

					});
					
				}

			};

	// socket

		socket.on('connect', function() {

			$scope.$apply(function() {

				if (getToken()) {
					_setStatus("validation");
					socket.emit('device.check', getToken());
				}

			});

		}).on('disconnect', function () {

			$scope.$apply(function() {
				_setStatus("disconnected");
			});

		}).on('device.check.error', function (err) {

			console.log(err);

			$scope.$apply(function() {
				_deleteToken();
				_setStatus("connected");
			});
			
		}).on('device.validated', function(token) {

			$scope.$apply(function() {

				_setToken(token);
				_setStatus("validation");
				socket.emit('device.check', token);
				
			});

		}).on('device.checked', function() {

			$scope.$apply(function() {
				_setStatus("validated");
			});

		});

	// constructor

		if (!getToken()) {

			$http.put("/api/devices").then(function(data) {

				_setToken(data.data.token);
				_setStatus("validation");

			}).catch(function(err) {

				$popup.alert({
					title: "Création de token",
					message: APIErrorToHTML(err),
					type: "danger"
				});

			});

		}

}]);
