app.factory("$logs", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "logs");
}]).controller("ControllerLogs", ["$scope", "$popup", "$logs", function($scope, $popup, $logs) {

	$scope.logs = {};

	$scope.seeLog = function(year, month, day, number) {

		/*$http.get("/api/logs/" + year + "/" + month + "/" + day + "/" + number).then(function(HTMLlogs) {

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
			
		});*/

	};

			$scope.delete = function(year, month, day, number) {

				$popup.confirm({
					message : "Voulez-vous vraiment supprimer le log du \"" + year + "/" + month + "/" + day + "\" ?",
					onyes : function() {

						/*$logs.delete(year, month, day, number).catch(function(err) {

							$popup.alert({
								title: "Suppression de log",
								message: err.message,
								type: "danger"
							});

						});*/

					}
				});

			};
	
	// socket
	
		socket.on("logs", function(data) {
			$scope.$apply(function () { $scope.logs = data; });
		}).on("logs.error", $popup.alert);

	// init
	
		$logs.onRefresh(function(data) {
			$scope.logs = data;
		});

}]);

jQuery(document).ready(function() {

	jQuery("#navLogs").click(function() {

		jQuery("#modalLogs").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});
