app.controller('ControllerDevices', ['$scope', '$popup', function($scope, $popup) {
		
    "use strict";

	$scope.devices = [];

    socket.on('devices', function (devices) {
        $scope.$apply(function () { $scope.devices = devices; });
    });

    /*$scope.allow = function (client) {
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
    };*/
    
}]);
