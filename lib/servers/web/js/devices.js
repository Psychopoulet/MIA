app.controller("ControllerDevices", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {
	
    "use strict";

    // private

        function _getDevices() {

            $MIA.search("devices").then(function(data) {
                $scope.devices = data;
            }).catch(function(err) {

                $popup.alert({
                    title: "Périphériques",
                    message: err.message,
                    type: "danger"
                });

            });

        }

    // public

        // attrs

	       $scope.devices = [];

        // interface

            $scope.valid = function (device) {

                $popup.alert({
                    title: "Validation de périphérique",
                    message: "En cours de création",
                    type: "info"
                });

                /*$MIA.edit("devices", device.token, {

                }).then(_getDevices).catch(function(err) {

                    $popup.alert({
                        title: "Validation de périphérique",
                        message: err,
                        type: "danger"
                    });

                });*/

            };

            $scope.rename = function (device) {

                $popup.alert({
                    title: "Renomage de périphérique",
                    message: "En cours de création",
                    type: "info"
                });

                /*$popup.prompt({
                    title: "Nouveau nom",
                    val: device.name,
                    onconfirm: function(name) {

                        device.name = name;

                        $http.post("/api/devices/" + device.token + "/rename", {
                            device: device,
                            token: getToken()
                        }).catch(function(err) {

                            $popup.alert({
                                title: "Renomage de ériphérique",
                                message: APIErrorToHTML(err),
                                type: "danger"
                            });

                        });

                    }
                });*/

            }

            $scope.delete = function (device) {

                $MIA.delete("devices", device.token).then(_getDevices).catch(function(err) {

                    $popup.alert({
                        title: "Suppression de périphérique",
                        message: err.message,
                        type: "danger"
                    });

                });

            };
    
    // socket

        $MIA.onLogin(_getDevices);

        socket.on("devices", function (devices) {
            $scope.$apply(function () { $scope.devices = devices; });
        });

}]);
