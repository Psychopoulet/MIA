app.factory("$crons", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "crons");
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
