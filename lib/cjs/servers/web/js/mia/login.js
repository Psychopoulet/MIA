app.controller("ControllerLogin", ["$scope", "$popup", "$token", "$controllerstypes", "$controllers", "$MIA", function($scope, $popup, $token, $controllerstypes, $controllers, $MIA) {

	"use strict";

	// private

		// methods

			function _isConnected(connected) {

				$scope.isDisconnected = !connected;
				$scope.isConnected = connected;

			}

			function _isValidated(controller) {

				$scope.isValidated = true;
				$scope.isWaitingForValidation = false;
				$scope.isWaitingForTokenCreation = false;

				$MIA.fireLogged(controller);
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

				// controller

				$scope.isValidated = false;
				$scope.isWaitingForValidation = false;
				$scope.isWaitingForTokenCreation = false;

		// interface

			$scope.log = function() {

				if (!$token.get("token")) {

					$popup.alert({
						title: "Enregistrement du contrôleur",
						message: "La création du contrôleur a échouée. Veuillez rafraichir votre navigateur.",
						type: "danger"
					});
							
				}
				else {

					$scope.loginInProgress = true;
					$MIA.login($scope.login, $scope.password).then(function(controller) {

						if (!controller || !controller.status || !controller.status.code || "ACCEPTED" !== controller.status.code) {

							$popup.alert({
								title: "Connexion",
								message: "Le contrôleur n'a pas pu être validé",
								type: "danger"
							});
								
						}
						else {
							_isValidated(controller);
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

			$controllers.searchOne($token.get("token")).then(function(controller) {

				if (!controller || !controller.status || !controller.status.code) {
					$token.delete();
					_isWaitingForValidation();
				}
				else if ("ACCEPTED" === controller.status.code) {
					_isValidated(controller);
				}
				else {
					_isWaitingForValidation();
				}

			}).catch(function(err) {

				if (401 === err.status) {

					$token.delete();

					$popup.alert({
						title: "Enregistrement du contrôleur",
						message: "La création du contrôleur a échouée. Veuillez rafraichir votre navigateur.",
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

			$controllerstypes.searchOne("WEB").then(function(controllertype) {

				console.log("controllers.add");

				return $controllers.add({ type: controllertype }, false);
				
			}).then(function(controller) {

				console.log("controllers.added");

				$token.set(controller.token);
				_isWaitingForValidation();

				$controllers.refresh();

			}).catch(function(err) {

				console.log("controllers.add fail");

				$popup.alert({
					title: "Enregistrement du contrôleur",
					message: err.message,
					type: "danger"
				});

			});

		}

}]);
