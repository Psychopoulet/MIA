app.controller('ControllerDevices', ['$scope', '$http', '$popup', function($scope, $http, $popup) {
	
    "use strict";

    // public

        // attrs

	       $scope.devices = [];

        // interface

            $scope.valid = function (device) {

                $http.post("/api/devices/" + device.token + "/validation", {
                    token: getToken()
                }).catch(function(err) {

                    $popup.alert({
                        title: "Validation de périphérique",
                        message: APIErrorToHTML(err),
                        type: "danger"
                    });

                });

            };

            $scope.rename = function (device) {

                $popup.prompt({
                    title: 'Nouveau nom',
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
                });

            }

            $scope.remove = function (device) {

                $http.delete("/api/devices/" + device.token, {
                    data: { token: getToken() }
                }).catch(function(err) {

                    $popup.alert({
                        title: "Suppression de périphérique",
                        message: APIErrorToHTML(err),
                        type: "danger"
                    });

                });

            };
    
    // socket

        socket.on('device.checked', function() {

            $http.get("/api/devices").then(function(res) {

                $scope.devices = res.data;
                    
            }).catch(function(err) {

                $popup.alert({
                    title: "Périphériques",
                    message: APIErrorToHTML(err),
                    type: "danger"
                });

            });

        }).on('devices', function (devices) {
            $scope.$apply(function () { $scope.devices = devices; });
        });

}]);
