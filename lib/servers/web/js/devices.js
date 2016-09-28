app.service("$devices", ["$q", "$MIA", function($q, $MIA) {

	"use strict";

	// private

		// attrs

			var _data = [], _onRefresh = [], that = this;

	// public

		// attrs

			this.module = "devices";

		// methods

			// read

			this.search = function(params) {

				if (params) {
					return $MIA.search(that.module, params);
				}
				else {
					return $MIA.search(that.module);
				}
				
			};

			this.searchOne = function(code) {
				return $MIA.searchOne(that.module, code);
			};

			this.refresh = function() {

				return that.search().then(function(data) {

					_data = data;

						angular.forEach(_onRefresh, function(callback) {

							$q(function() {
								callback(data);
							});

						});

					return $q.defer().resolve(data);

				});

			};

			this.onRefresh = function(callback) {

				if ("function" === typeof callback) {
					_onRefresh.push(callback);
				}

			};

			// write

			this.add = function(data) {
				return $MIA.add(that.module, data).then(that.refresh);
			};

			this.edit = function(code, data) {
				return $MIA.edit(that.module, code, data).then(that.refresh);
			};

			this.delete = function(code) {
				return $MIA.delete(that.module, code).then(that.refresh);
			};

	// init

		$MIA.onLogin(that.refresh);
	
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
