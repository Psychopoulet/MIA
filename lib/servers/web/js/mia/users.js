app.controller("ControllerUser", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

	"use strict";

	// public

		// attrs

			$scope.user = {};

			$scope.login = "";
			$scope.password = "";

		// interface

			$scope.editLogin = function (login) {

				if ($scope.user.login != login) {

					$popup.confirm({
						message: "Voulez-vous vraiment remplacer votre login \"" + $scope.user.login + "\" par \"" + login + "\" ?",
						onyes: function() {

							$MIA.edit("users", $scope.user.login, {
								login: login
							}).then(function(user) {

								user.password = "";
								$scope.user = user;

							}).catch(function(err) {

								$popup.alert({
									title: "Changement de login",
									message: err.message,
									type: "danger"
								});

							});

						}

					});

					
				}

			};

			$scope.editPassword = function (password) {

				if ("" != password) {

					$popup.prompt({
						title: "Confirmez le mot de passe :",
						label: "Mot de passe :",
						fieldtype: "password",
						onconfirm: function(confirmpassword) {

							if (password == confirmpassword) {

								$MIA.edit("users", $scope.user.login, {
									password: password
								}).then(function(user) {

									user.password = "";
									$scope.user = user;

								}).catch(function(err) {

									$popup.alert({
										title: "Changement de mot de passe",
										message: err.message,
										type: "danger"
									});

								});

							}
							else {
								
								$popup.alert({
									title: "Changement de mot de passe",
									message : "Le mot de passe de confirmaton est incorrect.",
									type: "danger"
								});

							}

						}

					});

				}

			};

	// init
	
		$MIA.onLogin(function(controller) {

			controller.user.password = "";
			$scope.user = controller.user;

			$scope.login = $scope.user.login;
			$scope.password = $scope.user.password;

		});

}]);

jQuery(document).ready(function() {

	jQuery("#navUsers").click(function() {

		jQuery("#modalUsers").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		}).on("shown.bs.modal", function () {
			jQuery("#formUserPassword").focus();
		});

		return false;

	});

});
