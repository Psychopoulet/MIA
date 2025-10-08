app.factory("$actions", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "actions");
}]).controller("ControllerActions", ["$scope", "$popup", "$actions", function($scope, $popup, $actions) {

	"use strict";

	// public

		// attrs

			$scope.actions = [];

		// interface

			$scope.add = function() {

				jQuery("#modalAction").modal({
					backdrop: "static",
					keyboard: false,
					show: true
				});
				
			};

			/*$scope.execute = function(action) {
				socket.emit("action.execute", action);
			};

			$scope.linkToCron = function() {
				
				jQuery("#modalLinkCronsActions").modal({
					backdrop: "static",
					keyboard: true,
					show: true
				});

			};*/

			$scope.delete = function(action) {

				$popup.confirm({
					message : "Voulez-vous vraiment supprimer l'action \"" + action.name + "\" ?",
					onyes : function() {
						
						$actions.delete(action.code).catch(function(err) {

							$popup.alert({
								title: "Suppression d'une action",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			};
		
	// socket

		socket.on("actions", function(data) {
			$scope.$apply(function () { $scope.actions = data; });
		}).on("actions.error", $popup.alert);

	// init

		$actions.onRefresh(function(data) {
			$scope.actions = data;
		});
	
}]);

/*

.controller("ControllerAction", ["$scope", "$actions", function($scope, $actions) {

	$scope.action = {};
	$scope.childs = $scope.actionstypes = [];

	jQuery("#modalAction").on("show.bs.modal", function () {

		$scope.actionstypes = $actions.actionstypes;
		$scope.childs = $actions.childs;
		
		if ($actions.writedaction) {
			$scope.action = $actions.writedaction;
		}

	}).on("shown.bs.modal", function () {
		jQuery("#formActionName").focus();
	});

		$scope.add = function(action) {
			socket.emit("action.add", action);
		};

		socket.on("action.added", function() {
			jQuery("#modalAction").modal("hide");
		});

}]);*/

jQuery(document).ready(function() {

	jQuery("#navActions").click(function() {

		jQuery("#modalActions").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});
