app.controller('ControllerWarcraftSounds', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

	"use strict";

	// attributes

        $scope.races = [];
            $scope.characters = [];
                $scope.actions = [];
            $scope.musics = [];
            $scope.warnings = [];

        $scope.children = [];
        $scope.selectedchild = null;

    // methods

        // public

            // previews

                $scope.selectRace = function() {

                    $scope.characters = [];
                        $scope.actions = [];
                    $scope.musics = [];
                    $scope.warnings = [];

                    socket.emit('web.warcraftsounds.characters.get', { race : $scope.selectedrace.code });
                    socket.emit('web.warcraftsounds.musics.get', { race : $scope.selectedrace.code });
                    socket.emit('web.warcraftsounds.warnings.get', { race : $scope.selectedrace.code });

                };
                $scope.selectCharacter = function() {
                    $scope.actions = [];
                    socket.emit('web.warcraftsounds.actions.get', { race : $scope.selectedrace.code, character : $scope.selectedcharacter.code });
                };

                $scope.previewAction = function() {
                    $popup.sound($scope.selectedaction.url, $scope.selectedaction.name);
                };

                $scope.previewMusic = function() {
                    $popup.sound($scope.selectedmusic.url, $scope.selectedmusic.name);
                };

                $scope.previewWarning = function() {
                    $popup.sound($scope.selectedwarning.url, $scope.selectedwarning.name);
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

                        socket.removeAllListeners('web.warcraftsounds.races.get');
                            socket.removeAllListeners('web.warcraftsounds.characters.get');
                                socket.removeAllListeners('web.warcraftsounds.actions.get');
                            socket.removeAllListeners('web.warcraftsounds.musics.get');
                            socket.removeAllListeners('web.warcraftsounds.warnings.get');

                        socket.removeAllListeners('web.warcraftsounds.error');
                    })
                    .on('connect', function () {

                        socket
                            .on('web.logged', function () {
                                socket.emit('web.warcraftsounds.races.get');
                            })
                            .on('web.warcraftsounds.races.get', function (p_tabData) {
                                $scope.races = p_tabData;
                                $scope.$apply();
                            })
                            .on('web.warcraftsounds.characters.get', function (p_tabData) {
                                $scope.characters = p_tabData;
                                $scope.$apply();
                            })
                                .on('web.warcraftsounds.actions.get', function (p_tabData) {
                                    $scope.actions = p_tabData;
                                    $scope.$apply();
                                })
                            .on('web.warcraftsounds.musics.get', function (p_tabData) {
                                $scope.musics = p_tabData;
                                $scope.$apply();
                            })
                            .on('web.warcraftsounds.warnings.get', function (p_tabData) {
                                $scope.warnings = p_tabData;
                                $scope.$apply();
                            })
                            .on('web.warcraftsounds.error', $popup.alert);

                    });

            // interface

    			jQuery('#menuWarcraft').click(function(e) {

    				e.preventDefault();
                    
    				jQuery('#modalWarcraft').modal({
                        backdrop : 'static',
                        keyboard: false,
                        show : true
                    });

    			});
                
}]);