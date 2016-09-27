app.controller("ControllerCrons", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

	"use strict";

	// private

		function _getCrons() {

			return $MIA.search("crons").then(function(data) {
				$scope.crons = data;
			}).catch(function(err) {

				$popup.alert({
					title: "Chargement des tâches plannifiées",
					message: err.message,
					type: "danger"
				});

			});

		}

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

						$MIA.delete("crons", cron.code).then(_getCrons).catch(function(err) {

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

		socket.on("crons", function(crons) {
			$scope.$apply(function () { $scope.crons = crons; });
		}).on("crons.error", $popup.alert);

	// init
	
		$MIA.onLogin(_getCrons);
		jQuery("#modalCron").on("hidden.bs.modal", _getCrons);

}]).controller("ControllerCron", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

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

				$MIA.add("crons", cron).then(function() {
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
