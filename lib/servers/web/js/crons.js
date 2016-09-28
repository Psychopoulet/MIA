app.service("$crons", ["$q", "$MIA", function($q, $MIA) {

	"use strict";

	// private

		// attrs

			var _data = [], _onRefresh = [], that = this;

	// public

		// attrs

			this.module = "crons";

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
	
}]).controller("ControllerCrons", ["$scope", "$popup", "$crons", function($scope, $popup, $crons) {

	"use strict";

	// public

		// attrs

			$scope.crons = {};

		// interface

			$scope.add = function () {

				jQuery("#modalCron").modal({
					backdrop: "static",
					keyboard: true,
					show: true
				});

			};

			$scope.delete = function (cron) {

				$popup.confirm({
					message : "Voulez-vous vraiment supprimer la tâche plannifiée \"" + cron.name + "\" ?",
					onyes : function() {

						$crons.delete(cron.code).catch(function(err) {

							$popup.alert({
								title: "Suppression d'une tâche plannifiée",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			};

			/*$scope.linkToAction = function () {

				jQuery("#modalLinkCronsActions").modal({
					backdrop: "static",
					keyboard: true,
					show: true
				});

			};*/

	// socket

		socket.on("crons", function(data) {
			$scope.$apply(function () { $scope.crons = data; });
		}).on("crons.error", $popup.alert);

	// init
	
		$crons.onRefresh(function(data) {
			$scope.crons = data;
		});

}]).controller("ControllerCron", ["$scope", "$popup", "$crons", function($scope, $popup, $crons) {

	"use strict";

	// public

		// attrs

			$scope.cron = {

				timer: {
					second: "*", minute: "*", hour: "*",
					monthday: "*", month: "*", weekday: "*"
				}

			};

		// interface

			$scope.add = function(cron) {

				$crons.add(cron).then(function() {
					jQuery("#modalCron").modal("hide");
				}).catch(function(err) {

					$popup.alert({
						title: "Ajout d'une tâche plannifiée",
						message: err.message,
						type: "danger"
					});

				});

			};

	// init
	
		jQuery("#modalCron").on("shown.bs.modal", function () {
			jQuery("#formCronName").focus();
		});

}]);

jQuery(document).ready(function() {

	jQuery("#navCrons").click(function() {

		jQuery("#modalCrons").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});
