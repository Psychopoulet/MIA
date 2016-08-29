app.controller("ControllerDevices", ["$scope", "$popup", "$MIA", function($scope, $popup, $MIA) {
	
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

        socket.on("device.checked", function() {

            $MIA.search("devices").then(function(data) {
                $scope.devices = data;
            }).catch(function(err) {

                $popup.alert({
                    title: "Périphériques",
                    message: err,
                    type: "danger"
                });

            });

        }).on("devices", function (devices) {
            $scope.$apply(function () { $scope.devices = devices; });
        });

}]);
