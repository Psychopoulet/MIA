app.controller('ControllerChildren', ['$scope', 'ModelYoutube', function($scope, ModelYoutube) {

	$scope.children = [];
	$scope.youtubevideos = [];

	$scope.play = function (token, youtubevideo) {
		socket.emit('child.youtube.play', { token : token, url : youtubevideo.url });
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

		})
		.on('connect', function () {

			jQuery('.only-disconnected, .only-logged').addClass('hidden');
			jQuery('.only-connected').removeClass('hidden');

			socket.on('child.logged', function (socketData) {

				ModelYoutube.getAll()
                    .then(function(p_tabData) {
                        $scope.youtubevideos = p_tabData;
                    })
                    .catch(alert);

				jQuery('.only-disconnected, .only-connected').addClass('hidden');
				jQuery('.only-logged').removeClass('hidden');

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