app.controller('ControllerWarcraftSounds', ['$scope', '$popup', function($scope, $popup) {

	"use strict";

	// attributes

		$scope.loading = true;

        $scope.data = [];
		$scope.selectedrace = null;

    // constructor

        // events

            // sockets

                socket
                    .on('disconnect', function () {
                        socket.removeAllListeners('child.warcraftsounds.getall');
                        socket.removeAllListeners('child.warcraftsounds.error');
                    })
                    .on('connect', function () {

                        socket
                            .on('child.logged', function () {
                                socket.emit('child.warcraftsounds.getall');
                            })
                            .on('child.warcraftsounds.getall', function (p_tabData) {
                                console.log(p_tabData);
                                $scope.data = p_tabData;
                                $scope.$apply();
                            })
                            .on('child.warcraftsounds.error', function(p_sMessage) {
                                $popup.alert(p_sMessage);
                            });

                    });

            // interface

    			jQuery('#menuWarcraft').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalWarcraft').modal('show');
    			});
                
}]);