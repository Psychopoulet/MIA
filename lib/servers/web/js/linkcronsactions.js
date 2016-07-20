app.controller('ControllerLinkCronsActions', ['$scope', '$popup', function($scope, $popup) {

	// attrs

		// private

			var transition, opacity,
				_cronsActions = [];

		// public

			$scope.crons = $scope.actions = [];

	// meths

		// private

			function _setActionsToCrons() {

				angular.forEach($scope.crons, function(cron, i) {

					$scope.crons[i].actions = [];

					angular.forEach(_cronsActions, function(cronaction) {

						if (cron.id === cronaction.cron.id) {
							$scope.crons[i].actions.push(cronaction.action);
						}

					});

				});

			}

		// public

			$scope.link = function(cron, action) {
				socket.emit('cronaction.link', { cron: cron, action: action });
			};

			$scope.unlink = function(cron, action) {
				socket.emit('cronaction.unlink', { cron: cron, action: action });
			};

	// events

		socket.on('logged', function() {
			socket.emit('cronsactions');
		})
		.on('crons', function(crons) {

			$scope.$apply(function () {
				$scope.crons = crons;
				_setActionsToCrons();
			});

		})
		.on('actions', function(actions) {
			$scope.$apply(function () { $scope.actions = actions; });
		})
		.on('cronsactions', function(cronsactions) {

			$scope.$apply(function () {
				_cronsActions = cronsactions;
				_setActionsToCrons();
			});

		})
		.on('cronsactions.error', $popup.alert);

	// interface

		interact('.cron-droppable').dropzone({
			accept: '.action-draggable',
			overlap: 0.3,
			ondragenter: function (e) {
				jQuery(e.target).addClass('list-group-item-success');
			},
			ondragleave: function (e) {
				jQuery(e.target).removeClass('list-group-item-success');
			},
			ondrop: function (e) {

				var cron, action;

				jQuery(e.target).removeClass('list-group-item-success');

				if (e.target.dataset.cron && e.relatedTarget.dataset.action) {

					for (var i = 0; i < $scope.crons.length; ++i) {

						if ($scope.crons[i].id == e.target.dataset.cron) {
							cron = $scope.crons[i];
							break;
						}

					}

					for (var i = 0; i < $scope.actions.length; ++i) {

						if ($scope.actions[i].id == e.relatedTarget.dataset.action) {
							action = $scope.actions[i];
							break;
						}

					}

					if (cron && action) {
						$scope.link(cron, action);
					}

				}

			}

		});

		interact('.action-draggable').draggable({
			autoScroll: true,
			onmove: function (e) {

				var x = (parseFloat(e.target.dataset.x) || 0) + e.dx,
					y = (parseFloat(e.target.dataset.y) || 0) + e.dy;

				e.target.style.webkitTransform = e.target.style.transform = 'translate3D(' + x + 'px, ' + y + 'px, 0)';

				e.target.dataset.x = x;
				e.target.dataset.y = y;

			},
			onstart: function (e) {

				transition = e.target.style.transition;
				opacity = e.target.style.opacity;

				e.target.style.transition = '0s';
				e.target.style.opacity = '0.4';

			},

			onend: function (e) {

				e.target.style.transition = transition;
				e.target.style.opacity = opacity;

				e.target.style.webkitTransform = e.target.style.transform = 'translate3D(0, 0, 0)';

				transition = opacity = e.target.dataset.x = e.target.dataset.y = null;

			}

		});

}]);
