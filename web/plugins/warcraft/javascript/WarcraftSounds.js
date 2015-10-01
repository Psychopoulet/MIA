app.controller('ControllerWarcraftSounds', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

	"use strict";

	// attributes

		$scope.loading = true;

        $scope.races = [];
		$scope.selectedrace = null;

        $scope.children = [];
        $scope.selectedchild = null;

    // methods

        // public

            // previews

                $scope.previewAction = function() {
                    $popup.preview($scope.selectedaction.url);
                };

                $scope.previewMusic = function() {
                    $popup.preview($scope.selectedmusic.url);
                };

                $scope.previewWarning = function() {
                    $popup.preview($scope.selectedwarning.url);
                };

            // plays

                $scope.playAction = function() {

                    socket.emit('child.warcraftsounds.play', {
                        token : $scope.selectedchild.token,
                        url : $scope.selectedaction.url
                    });

                };

                $scope.playMusic = function() {

                    socket.emit('child.warcraftsounds.play', {
                        token : $scope.selectedchild.token,
                        url : $scope.selectedmusic.url
                    });

                };

                $scope.playWarning = function() {

                    socket.emit('child.warcraftsounds.play', {
                        token : $scope.selectedchild.token,
                        url : $scope.selectedwarning.url
                    });

                };

    // constructor

        // events

            ModelChildren
                .onChange(function(p_tabData) {
                    $scope.children = p_tabData;
                    $scope.selectedchild = null;
                    $scope.$apply();
                });

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
                                $scope.races = p_tabData;
                                $scope.loading = false;
                                $scope.$apply();
                            })
                            .on('child.warcraftsounds.error', $popup.alert);

                    });

            // interface

    			jQuery('#menuWarcraft').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalWarcraft').modal('show');
    			});
                
}]);