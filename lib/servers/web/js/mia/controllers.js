app.factory("$controllers", ["$q", "$MIA", function ($q, $MIA) {

	let model = new AbstractMIAModel($q, $MIA, "controllers", false);

		model.add = function(data) {
			return $MIA.add("controllers", data);
		};

	return model;

}]).controller("ControllerControllers", ["$scope", "$popup", "$controllers", "$status", function($scope, $popup, $controllers, $status) {

	"use strict";

	// private

		function _setStatus(title, status, controller) {

			$status.searchOne(status).then(function(status) {

				if (!status) {

					$popup.alert({
						title: title,
						message: "Ce statut n'existe pas",
						type: "danger"
					});

				}
				else {

					var _controller = {};
					angular.copy(controller, _controller);

					_controller.status = status;

					$controllers.edit(_controller.token, _controller).catch(function(err) {

						$popup.alert({
							title: title,
							message: err.message,
							type: "danger"
						});

					});

				}
				
			}).catch(function(err) {

				$popup.alert({
					title: title,
					message: err.message,
					type: "danger"
				});

			});

		}

	// public

		// attrs

			$scope.controllers = [];

		// interface

			$scope.valid = function (controller) {
				_setStatus("Validation de contrôleur", "ACCEPTED", controller);
			};

			$scope.block = function (controller) {
				_setStatus("Validation de contrôleur", "BLOCKED", controller);
			};
	
			$scope.rename = function (controller) {

				$popup.prompt({
					title: "Nouveau nom",
					val: controller.name,
					onconfirm: function(name) {

						var _controller = {};
						angular.copy(controller, _controller);

						_controller.name = name;

						$controllers.edit(_controller.token, _controller).catch(function(err) {

							$popup.alert({
								title: "Renomage de contrôleur",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			}

			$scope.delete = function (controller) {

				$controllers.delete(controller.token).catch(function(err) {

					$popup.alert({
						title: "Suppression de contrôleur",
						message: err.message,
						type: "danger"
					});

				});

			};

	// socket

		socket.on("controllers", function (data) {
			$scope.$apply(function () { $scope.controllers = data; });
		}).on("controllers.error", $popup.alert);

	// init
	
		$controllers.onRefresh(function(data) {
			$scope.controllers = data;
		});

}]);
