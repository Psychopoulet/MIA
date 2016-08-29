app.controller("ControllerLogin", ["$scope", "$popup", "$token", "$MIA", function($scope, $popup, $token, $MIA) {

	"use strict";

	// private

		// methods

			function _setStatus(status) {

				jQuery(".only-disconnected, .only-tokencreation, .only-connected, .only-validation, .only-validated").addClass("hidden-xs-up");
				jQuery(".only-" + status).removeClass("hidden-xs-up");

				switch(status) {

					case "connected":
						jQuery("#login_login").focus();
					break;

				}

			}

	// public

		// attrs

			$scope.loginInProgress = false;

		// interface

			$scope.log = function() {

				if (!$token.get("token")) {

					$popup.alert({
						title: "La création du périphérique a échouée. Veuillez raffraichir votre navigateur.",
						message: APIErrorToHTML(err),
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
							_setStatus("validated");
						}

					}).catch(function(err) {

						$popup.alert({
							title: "Login",
							message: err,
							type: "danger"
						});

					}).finally(function() {

						$scope.loginInProgress = false;

					});
					
				}

			};

	// socket

		socket.on("connect", function() {

			$scope.$apply(function() {

				if ($token.get("token")) {
					_setStatus("validation");
					socket.emit("device.check", $token.get("token"));
				}

			});

		}).on("disconnect", function () {

			$scope.$apply(function() {
				_setStatus("disconnected");
			});

		}).on("device.check.error", function (err) {

			console.log(err);

			$scope.$apply(function() {
				$token.delete();
				_setStatus("connected");
			});
			
		}).on("device.validated", function(token) {

			$scope.$apply(function() {

				$token.set(token);
				_setStatus("validation");
				socket.emit("device.check", token);
				
			});

		}).on("device.checked", function() {

			$scope.$apply(function() {
				_setStatus("validated");
			});

		});

	// constructor

		if (!$token.get("token")) {

			_setStatus("tokencreation");

			$MIA.searchOne("devicestypes", "WEB").then(function(devicetype) {

				return $MIA.add("devices", { type: devicetype });

			}).then(function(device) {

				$token.set(device.token);
				_setStatus("validation");

			}).catch(function(err) {

				$popup.alert({
					title: "Enregistrement du périphérique",
					message: err,
					type: "danger"
				});

			});

		}

}]);
