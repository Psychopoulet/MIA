app.controller("ControllerPlugins", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {

	// private

		function _getPlugins() {

			$MIA.search("plugins").then(function(data) {
				$scope.plugins = data;
			}).catch(function(err) {

				$popup.alert({
					title: "Plugins",
					message: err.message,
					type: "danger"
				});

			});

		}

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

						$MIA.add("plugins", { "origin": "github", "url": url }).then(_getPlugins).catch(function(err) {

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

						$MIA.edit("plugins", plugin.name).then(_getPlugins).catch(function(err) {

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

						$MIA.delete("plugins", plugin.name).then(_getPlugins).catch(function(err) {

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
	
		socket.on("plugins", function(plugins) {
			$scope.$apply(function () { $scope.plugins = plugins; });
		});

	// init
	
		$MIA.onLogin(_getPlugins);

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
