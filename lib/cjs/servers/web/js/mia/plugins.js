app.factory("$plugins", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "plugins");
}]).controller("ControllerPlugins", ["$scope", "$popup", "$plugins", function($scope, $popup, $plugins) {

	"use strict";

	// public

		// attrs

			$scope.plugins = [];

		// interface

			$scope.addViaGithub = function() {

				$popup.prompt({
					title : "Ajout de plugin",
					size: "medium",
					placeholder : "https://github.com/<compte>/<plugin>",
					onconfirm: function(url) {

						$plugins.add({ "origin": "github", "url": url }).catch(function(err) {

							$popup.alert({
								title: "Ajout de plugin",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			};

			$scope.updateViaGithub = function(plugin) {

				$popup.confirm({
					title : "Mise à jour de plugin",
					message: "Voulez-vous mettre le plugin \"" + plugin.name + "\" à jour ?",
					onyes: function() {

						$plugins.edit(plugin.name).catch(function(err) {

							$popup.alert({
								title: "Mise à jour de plugin",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			};

			$scope.delete = function(plugin) {

				$popup.confirm({
					message : "Voulez-vous vraiment supprimer le plugin \"" + plugin.name + "\" ?",
					onyes : function() {

						$plugins.delete(plugin.name).catch(function(err) {

							$popup.alert({
								title: "Suppression de plugin",
								message: err.message,
								type: "danger"
							});

						});

					}
				});

			};
	
	// socket
	
		socket.on("plugins", function(data) {
			$scope.$apply(function () { $scope.plugins = data; });
		}).on("plugins.error", $popup.alert);

	// init
	
		$plugins.onRefresh(function(data) {
			$scope.plugins = data;
		});

}]);

jQuery(document).ready(function() {

	jQuery("#navPlugins").click(function() {

		jQuery("#modalPlugins").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});
