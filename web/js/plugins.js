app.controller('ControllerPlugins', ['$scope', '$popup', function($scope, $popup) {

	$scope.plugins = [];

	socket.on('logged', function() {
		socket.emit('plugins');
	})
	.on('plugins', function(plugins) {
		$scope.plugins = plugins;
		$scope.$apply();
	})
	.on('plugins.error', $popup.alert);

	$scope.addViaGithub = function(url) {

		$popup.prompt("Ajout de plugin", "", function(url) {
			socket.emit('plugin.add.github', url);
		});

	};

	$scope.delete = function(plugin) {

		$popup.confirm("Voulez-vous vraiment supprimer le plugin '" + plugin.name + "' ?", '', function() {
			socket.emit('plugin.delete', plugin);
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
