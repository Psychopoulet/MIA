app.controller('ControllerPlugins', ['$scope', '$popup', function($scope, $popup) {

	$scope.plugins = [];

	socket.on('logged', function() {
		socket.emit('plugins');
	})
	.on('plugins', function(plugins) {
        $scope.$apply(function () { $scope.plugins = plugins; });
	})
	.on('plugin.updated', function(plugin) {

		$popup.alert({
			message: "Le plugin '" + plugin.name + "' a été mis à jour.",
			type: 'info'
		});

	})
	.on('plugins.error', function(err) {

		$popup.alert({
			title: "Plugins",
			message: (err.message) ? err.message : err,
			type: "danger"
		});

	});

	$scope.addViaGithub = function() {

		$popup.prompt({
			title : "Ajout de plugin",
			size: 'medium',
			prefix: "https://github.com/",
			placeholder : "<compte>/<plugin>",
			onconfirm: function(url) {
				socket.emit('plugin.add.github', "https://github.com/" + url);
			}
		});

	};

	$scope.updateViaGithub = function(plugin) {

		$popup.confirm({
			title : "Mise à jour de plugin",
			message: "Voulez-vous mettre le plugin '" + plugin.name + "' à jour ?",
			onyes: function() {
				socket.emit('plugin.update.github', plugin);
			}
		});

	};

	$scope.delete = function(plugin) {

		$popup.confirm({
            message : "Voulez-vous vraiment supprimer le plugin '" + plugin.name + "' ?",
            onyes : function() {
				socket.emit('plugin.delete', plugin);
            }
        });

	};

}]);

jQuery(document).ready(function() {

	jQuery('#navPlugins').click(function() {

		jQuery('#modalPlugins').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

		return false;

	});

});
