app.factory("$devices", ["$q", "$MIA", function ($q, $MIA) {

	let model = new AbstractMIAModel($q, $MIA, "devices", false);

		model.add = function(data) {
			return $MIA.add("devices", data);
		};

	return model;

}]).controller("ControllerDevices", ["$scope", "$popup", "$devices", "$status", function($scope, $popup, $devices, $status) {

	"use strict";

	// private

		function _setStatus(title, status, device) {

			$status.searchOne(status).then(function(status) {

				if (!status) {

					$popup.alert({
						title: title,
						message: "Ce statut n'existe pas",
						type: "danger"
					});

				}
				else {

					var _device = {};
					angular.copy(device, _device);

					_device.status = status;

					$devices.edit(_device.token, _device).catch(function(err) {

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

			$scope.devices = [];

		// interface

			$scope.valid = function (device) {
				_setStatus("Validation de périphérique", "ACCEPTED", device);
			};

			$scope.block = function (device) {
				_setStatus("Validation de périphérique", "BLOCKED", device);
			};
	
			$scope.rename = function (device) {

				$popup.prompt({
					title: "Nouveau nom",
					val: device.name,
					onconfirm: function(name) {

						var _device = {};
						angular.copy(device, _device);

						_device.name = name;

						$devices.edit(_device.token, _device).catch(function(err) {

							$popup.alert({
								title: "Renomage de périphérique",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			}

			$scope.delete = function (device) {

				$devices.delete(device.token).catch(function(err) {

					$popup.alert({
						title: "Suppression de périphérique",
						message: err.message,
						type: "danger"
					});

				});

			};

	// socket

		socket.on("devices", function (data) {
			$scope.$apply(function () { $scope.devices = data; });
		}).on("devices.error", $popup.alert);

	// init
	
		$devices.onRefresh(function(data) {
			$scope.devices = data;
		});

}]);
