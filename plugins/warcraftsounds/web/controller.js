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

                    socket.emit('web.warcraftsounds.action.play', {
                        child : $scope.selectedchild,
                        action : $scope.selectedaction
                    });

                };

                $scope.playMusic = function() {

                    socket.emit('web.warcraftsounds.music.play', {
                        child : $scope.selectedchild,
                        music : $scope.selectedmusic
                    });

                };

                $scope.playWarning = function() {

                    socket.emit('web.warcraftsounds.warning.play', {
                        child : $scope.selectedchild,
                        warning : $scope.selectedwarning
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
                        socket.removeAllListeners('web.warcraftsounds.getall');
                        socket.removeAllListeners('web.warcraftsounds.error');
                    })
                    .on('connect', function () {

                        socket
                            .on('web.logged', function () {
                                socket.emit('web.warcraftsounds.getall');
                            })
                            .on('web.warcraftsounds.getall', function (p_tabData) {
                                $scope.races = p_tabData;
                                $scope.loading = false;
                                $scope.$apply();
                            })
                            .on('web.warcraftsounds.error', $popup.alert);

                    });

            // interface

    			jQuery('#menuWarcraft').click(function(e) {
    				e.preventDefault();
    				jQuery('#modalWarcraft').modal('show');
    			});
                
}]);