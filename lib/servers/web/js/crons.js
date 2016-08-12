app.controller('ControllerCron', ['$scope', '$popup', function($scope, $popup) {

	$scope.cron = {};

	jQuery('#modalCron').on('shown.bs.modal', function () {
		jQuery('#formCronName').focus();
	});

		$scope.add = function(cron) {
			socket.emit('cron.add', cron);
		};

		socket.on('cron.added', function() {
			$scope.cron = {};
			jQuery('#modalCron').modal('hide');
		})
		.on('cron.add.error', $popup.alert);

}])

.controller('ControllerCrons', ['$scope', '$popup', function($scope, $popup) {

	$scope.crons = {};

		socket.on('logged', function() {
			socket.emit('crons');
		})
		.on('crons', function(crons) {
	        $scope.$apply(function () { $scope.crons = crons; });
		})
		.on('crons.error', $popup.alert);

	$scope.add = function () {

		jQuery('#modalCron').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

	};

	$scope.linkToAction = function () {

		jQuery('#modalLinkCronsActions').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

	};

		$scope.delete = function (cron) {

			$popup.confirm({
				message : "Voulez-vous vraiment supprimer la tâche plannifiée '" + cron.name + "' ?",
				onyes : function() {
					socket.emit('cron.delete', cron);
				}
			});

		};

}]);

jQuery(document).ready(function() {

	jQuery('#navCrons').click(function() {

		jQuery('#modalCrons').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

		return false;

	});

});
