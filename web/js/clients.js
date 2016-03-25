app.controller('ControllerClients', ['$scope', '$popup', function($scope, $popup) {
		
    "use strict";

	$scope.clients = [];

    socket.on('client.allow.error', $popup.alert)
    .on('client.delete.error', $popup.alert)
    .on('clients', function (clients) {
        $scope.$apply(function () { $scope.clients = clients; });
    });

    $scope.allow = function (client) {
        socket.emit('client.allow', client);
    };

    $scope.rename = function (client) {

        $popup.prompt({
            title: 'Nouveau nom',
            val: client.name,
            onconfirm: function(name) {

                client.name = name;
                socket.emit('client.rename', client);

            }
        });

    }

    $scope.delete = function (client) {
        socket.emit('client.delete', client);
    };
    
}]);
