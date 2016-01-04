app.service('ModelClients', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnChange = [];

    // methods

        // public

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

    // constructor

		socket.on('web.clients', function (clients) {

			angular.forEach(m_tabOnChange, function (p_fCallback) {
	            p_fCallback(clients);
	        });

		});

});

app.controller('ControllerClients', ['$scope', '$popup', 'ModelClients', function($scope, $popup, ModelClients) {
		
    "use strict";

	$scope.clients = [];

	ModelClients.onChange(function(p_tabData) {
		$scope.clients = p_tabData;
		$scope.$apply();
	});
	
}]);