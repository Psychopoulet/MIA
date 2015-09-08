app.controller('ControllerChildren', ['$scope', function($scope) {

	$scope.children = [];

	$scope.play = function (token, url) {
		socket.emit('child.youtube.play', { token : token, url : url });
	};
	
	socket
		.on('disconnect', function () {

			jQuery('.only-logged, .only-connected').addClass('hidden');
			jQuery('.only-disconnected').removeClass('hidden');

			socket.removeAllListeners('child.logged');

			socket.removeAllListeners('child.connection');
			socket.removeAllListeners('child.getconnected');
			socket.removeAllListeners('child.disconnected');
			socket.removeAllListeners('child.temperature');
			socket.removeAllListeners('child.youtube.error');

		})
		.on('connect', function () {

			jQuery('.only-disconnected, .only-logged').addClass('hidden');
			jQuery('.only-connected').removeClass('hidden');

			socket.on('child.logged', function (socketData) {

				jQuery('.only-disconnected, .only-connected').addClass('hidden');
				jQuery('.only-logged').removeClass('hidden');

				socket.on('child.youtube.error', function (error) {
					alert(error);
				});

				socket.on('child.temperature', function (child) {

					for (var i = 0; i < $scope.children.length; ++i) {

						if (child.token == $scope.children[i].token) {
							$scope.children[i].temperature = child.temperature;
						}

					}

					$scope.$apply();

				});
				
				socket
					.on('child.getconnected', function(children) {
						$scope.children = children;
						$scope.$apply();
					})
					.on('child.connection', function(child) {
						$scope.children.push(child);
						$scope.$apply();
					})
					.on('child.disconnected', function(child) {
						
						for (var i = 0; i < $scope.children.length; ++i) {

							if (child.token == $scope.children[i].token) {
								$scope.children.splice(i, 1);
							}

						}

						$scope.$apply();

					});

				socket.emit('child.getconnected');
				
			});

		});
		
}]);