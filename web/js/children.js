app.service('ModelChildren', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnChange = [],
            m_tabData = [];

    // methods

        // protected

            function _execOnChange() {

                angular.forEach(m_tabOnChange, function (p_fCallback) {
                    p_fCallback(m_tabData);
                });

                return that;

            }

        // public

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

    // constructor

		socket
			.on('disconnect', function () {

				socket.removeAllListeners('web.logged');

				socket.removeAllListeners('web.connection');
				socket.removeAllListeners('web.getconnected');
				socket.removeAllListeners('web.disconnected');

			})
			.on('connect', function () {

				socket.on('web.logged', function (socketData) {

					socket
						.on('web.getconnected', function(children) {

							m_tabData = children;

							angular.forEach(m_tabData, function(value) {
								value.connected = true;
							});
							
							_execOnChange();

						})
						.on('web.connection', function(child) {

							var bExists = false;

							for (var i = 0; i < m_tabData.length; ++i) {

								if (child.token == m_tabData[i].token) {
									m_tabData[i].connected = true;
									bExists = true;
								}

							}

							if (!bExists) {
								child.connected = true;
								m_tabData.push(child);
							}

							_execOnChange();

						})
						.on('web.disconnected', function(child) {

							angular.forEach(m_tabData, function(value) {

								if (child.token == value.token) {
									value.connected = false;
								}

							});
							
							_execOnChange();

						});

					socket.emit('web.getconnected');
					
				});

			});

});

app.controller('ControllerChildren', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

	$scope.children = [];

	socket
		.on('disconnect', function () {

			$popup.closeAll();

			jQuery('.only-logged, .only-connected').addClass('hidden');
			jQuery('.only-disconnected').removeClass('hidden');

			socket.removeAllListeners('web.logged');
			socket.removeAllListeners('web.temperature');

		})
		.on('connect', function () {

			jQuery('.only-disconnected, .only-logged').addClass('hidden');
			jQuery('.only-connected').removeClass('hidden');

			socket.on('web.logged', function (socketData) {

				jQuery('.only-disconnected, .only-connected').addClass('hidden');
				jQuery('.only-logged').removeClass('hidden');

				socket.on('web.temperature', function (child) {

					angular.forEach($scope.children, function(value, key) {

						if (child.token == value.token) {
							$scope.children[key].temperature = child.temperature;
						}

					});
					
					$scope.$apply();

				});
				
			});

		});

		ModelChildren.onChange(function(p_tabData) {
			$scope.children = p_tabData;
			$scope.$apply();
		});
		
}]);