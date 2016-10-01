app.controller("ControllerLogin", ["$scope", "$popup", "$token", "$devicestypes", "$devices", "$MIA", function($scope, $popup, $token, $devicestypes, $devices, $MIA) {

	"use strict";

	// private

		// methods

			function _isConnected(connected) {

				$scope.isDisconnected = !connected;
				$scope.isConnected = connected;

			}

			function _isValidated(device) {

				$scope.isValidated = true;
				$scope.isWaitingForValidation = false;
				$scope.isWaitingForTokenCreation = false;

				$MIA.fireLogged(device);
				socket.emit("token", $token.get("token"));

			}

			function _isWaitingForValidation() {

				$scope.isValidated = false;
				$scope.isWaitingForValidation = true;
				$scope.isWaitingForTokenCreation = false;

				jQuery("#login_login").focus();

			}

			function _isWaitingForTokenCreation() {

				$scope.isValidated = false;
				$scope.isWaitingForValidation = false;
				$scope.isWaitingForTokenCreation = true;

			}

	// public

		// attrs

			$scope.loginInProgress = false;

			// status

				// socket

				$scope.isDisconnected = true;
				$scope.isConnected = false;

				// device

				$scope.isValidated = false;
				$scope.isWaitingForValidation = false;
				$scope.isWaitingForTokenCreation = false;

		// interface

			$scope.log = function() {

				if (!$token.get("token")) {

					$popup.alert({
						title: "Enregistrement du périphérique",
						message: "La création du périphérique a échouée. Veuillez rafraichir votre navigateur.",
						type: "danger"
					});
							
				}
				else {

					$scope.loginInProgress = true;
					$MIA.login($scope.login, $scope.password).then(function(device) {

						if (!device || !device.status || !device.status.code || "ACCEPTED" !== device.status.code) {

							$popup.alert({
								title: "Connexion",
								message: "Le périphérique n'a pas pu être validé",
								type: "danger"
							});
								
						}
						else {
							_isValidated(device);
						}

					}).catch(function(err) {

						$popup.alert({
							title: "Login",
							message: err.message,
							type: "danger",
							onclose : function() {
								jQuery("#login_login").focus();
							}
						});

					}).finally(function() {
						$scope.loginInProgress = false;
					});
					
				}

			};

	// socket

		socket.on("connect", function() {

			$scope.$apply(function() {
				_isConnected(true);
			});

		}).on("disconnect", function () {

			$scope.$apply(function() {
				_isConnected(false);
			});

		}).on("token", function (token) {

			if (!token) {

				$popup.alert({
					title: "Activation des sockets",
					message: "Le token n'a pas été renvoyé",
					type: "danger"
				});

			}
			else if (token != $token.get("token")) {

				$popup.alert({
					title: "Activation des sockets",
					message: "Le token renvoyé ne correspond pas",
					type: "danger"
				});

			}

		}).on("token.error", function (err) {

			$popup.alert({
				title: "Activation des sockets",
				message: $MIA.APIErrorToHTML(err),
				type: "danger"
			});

		});

	// constructor

		if ($token.get("token")) {

			$devices.searchOne($token.get("token")).then(function(device) {

				if (!device || !device.status || !device.status.code) {
					$token.delete();
					_isWaitingForValidation();
				}
				else if ("ACCEPTED" === device.status.code) {
					_isValidated(device);
				}
				else {
					_isWaitingForValidation();
				}

			}).catch(function(err) {

				if (401 === err.status) {

					$token.delete();

					$popup.alert({
						title: "Enregistrement du périphérique",
						message: "La création du périphérique a échouée. Veuillez rafraichir votre navigateur.",
						type: "danger"
					});

				}
				else {

					$popup.alert({
						title: "Connexion",
						message: err.message,
						type: "danger"
					});

				}

			});

		}
		else {

			_isWaitingForTokenCreation();

			$devicestypes.searchOne("WEB").then(function(devicetype) {

				console.log("devices.add");

				return $devices.add({ type: devicetype }, false);
			}).then(function(device) {

				console.log("devices.added");

				$token.set(device.token);
				_isWaitingForValidation();

				$devices.refresh();

			}).catch(function(err) {

				console.log("devices.add fail");

				$popup.alert({
					title: "Enregistrement du périphérique",
					message: err.message,
					type: "danger"
				});

			});

		}

}]);
