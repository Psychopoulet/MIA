app.controller("ControllerDevices", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

	"use strict";

	// private

		function _getDevices() {

			return $MIA.search("devices").then(function(data) {
				$scope.devices = data;
			});

		}

		function _setStatus(title, status, device) {

			$MIA.searchOne("status", status).then(function(status) {

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

					$MIA.edit("devices", _device.token, _device).then(function() {
						return _getDevices();
					}).catch(function(err) {

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

						$MIA.edit("devices", _device.token, _device).then(function() {
							return _getDevices();
						}).catch(function(err) {

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

				$MIA.delete("devices", device.token).then(function() {
					return _getDevices();
				}).catch(function(err) {

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
	
		$MIA.onLogin(function() {

			_getDevices().catch(function(err) {

				$popup.alert({
					title: "Chargement des périphériques",
					message: err.message,
					type: "danger"
				});

			});

		});

}]);
