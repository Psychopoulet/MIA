app.controller("ControllerLogs", ["$scope", "$http", "$popup", function($scope, $http, $popup) {

	$scope.logs = {};

	$scope.seeLog = function(year, month, day, number) {

		$http.get("/api/logs/" + year + "/" + month + "/" + day + "/" + number).then(function(HTMLlogs) {

			console.log(HTMLlogs);

			$popup.alert({
				title: "Log",
				message: HTMLlogs,
				size: "large",
				maxheight: 500
			});

		}).catch(function(err) {

			$popup.alert({
				title: "Logs",
				message: (err.message) ? err.message : err,
				type: "danger"
			});
			
		});

	};

	jQuery("#navLogs").click(function() {

		$scope.$apply(function () {

			$http.get("/api/logs").then(function(logs) {

				console.log(logs);
				$scope.logs = logs;

				jQuery("#modalLogs").modal({
					backdrop: "static",
					keyboard: true,
					show: true
				});

			}).catch(function(err) {

				$popup.alert({
					title: "Logs",
					message: (err.message) ? err.message : err,
					type: "danger"
				});

			});

		});

		return false;

	});

}]);
