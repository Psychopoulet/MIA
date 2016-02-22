app.controller('ControllerChilds', ['$scope', '$popup', function($scope, $popup) {

    "use strict";

	$scope.childs = [];

    socket.on('child.allow.error', $popup.alert)
    .on('child.delete.error', $popup.alert)
    .on('childs', function (childs) {

        $scope.childs = childs;
        $scope.$apply();

    });

    $scope.allow = function (child) {
        socket.emit('child.allow', child);
    };

    $scope.rename = function (child) {

        $popup.prompt('Nouveau nom', child.name, function(name) {

            child.name = name;
            socket.emit('child.rename', child);

        });

    }

    $scope.delete = function (child) {
        socket.emit('child.delete', child);
    };
    
}]);
