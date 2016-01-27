app.service('ModelClients', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnError = [],
            m_tabOnChange = [];

    // methods

        // public

            this.onError = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnError.push(p_fCallback);
                }

                return that;

            };

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

            this.allow = function (client) {
                socket.emit('client.allow', client);
                return that;
            };

            this.rename = function (client) {
                socket.emit('client.rename', client);
                return that;
            };

            this.delete = function (client) {
                socket.emit('client.delete', client);
                return that;
            };

    // constructor

		socket.on('client.allow.error', function (p_sMessage) {

            angular.forEach(m_tabOnError, function (p_fCallback) {
                p_fCallback(p_sMessage);
            });

        })
        .on('client.delete.error', function (p_sMessage) {

            angular.forEach(m_tabOnError, function (p_fCallback) {
                p_fCallback(p_sMessage);
            });

        })
        .on('clients', function (clients) {

			angular.forEach(m_tabOnChange, function (p_fCallback) {
	            p_fCallback(clients);
	        });

		});

});

app.controller('ControllerClients',
['$scope', '$popup', 'ModelClients'/*, 'ModelEvents'*/,
function($scope, $popup, ModelClients/*, ModelEvents*/) {
		
    "use strict";

    // attrs

	$scope.clients = [];

    // meths

    $scope.allow = ModelClients.allow;
    
    $scope.rename = function (client) {

        $popup.prompt('Nouveau nom', client.name, function(name) {

            client.name = name;
            ModelClients.rename(client);

        });

    }

    $scope.delete = ModelClients.delete;

    // events

    ModelClients.onError($popup.alert)
    /*.onAllow(function(client) {
        ModelEvents.add('', 'MIA', "Le client '" + client.name + "' a été autorisé.");
        $scope.clients.push(client);
        $scope.$apply();
    })*/
    .onChange(function(clients) {
        $scope.clients = clients;
        $scope.$apply();
    });

}]);