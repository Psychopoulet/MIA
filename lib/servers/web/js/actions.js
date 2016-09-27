app/*.service("$actions", ["$q", "$popup", function($q, $popup) {

	"use strict";

	var that = this;

	this.writedaction = null;
	this.actionstypes = this.childs = [];

	this.add = function(code, name, child, type, params) {

		that.writedaction = {
			id: null,
			code: (code) ? code : "",
			name: (name) ? name : "",
			child: (child) ? child : null,
			type: (type) ? type : null,
			params: (params) ? params : null
		};

		jQuery("#modalAction").modal({
			backdrop: "static",
			keyboard: false,
			show: true
		});

	};

	this.getActionTypeByCommand = function(command) {

		var result = null;

			for (var i = 0; i < that.actionstypes; ++i) {

				if (that.actionstypes[i].command == command) {
					result = that.actionstypes[i].command;
					break;
				}

			}

		return result;

	};

		socket.on("actionstypes", function(actionstypes) {
			that.actionstypes = actionstypes;
		})
		.on("childs", function(childs) {
			that.childs = childs;
		})
		.on("actionstypes.error", $popup.alert);

		socket.emit("actionstypes");

}])*/.controller("ControllerActions", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

	"use strict";

	// private

		function _getActions() {

			return $MIA.search("actions").then(function(data) {
				$scope.actions = data;
			}).catch(function(err) {

				$popup.alert({
					title: "Chargement des actions",
					message: err.message,
					type: "danger"
				});

			});

		}

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
						
						$MIA.delete("actions", action.code).then(_getActions).catch(function(err) {

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

		$MIA.onLogin(_getActions);
	
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
