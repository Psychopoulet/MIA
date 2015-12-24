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

			// selects

				$scope.emptyRace = function() {

					$scope.selectedrace = false;

						$scope.selectedmusic = false;
						$scope.selectedwarning = false;
						$scope.selectedcharacter = false;

					$scope.characters = [];
						$scope.actions = [];
					$scope.musics = [];
					$scope.warnings = [];

				};

				$scope.selectRace = function(p_stRace) {

					$scope.emptyRace();

					if (p_stRace && p_stRace.code) {

						$scope.selectedrace = p_stRace;

						socket.emit('web.warcraftsounds.characters.get', { race : p_stRace.code });
						socket.emit('web.warcraftsounds.musics.get', { race : p_stRace.code });
						socket.emit('web.warcraftsounds.warnings.get', { race : p_stRace.code });

					}

				};

				$scope.emptyCharacter = function() {
					$scope.selectedcharacter = false;
					$scope.actions = [];
				};

				$scope.selectCharacter = function(p_stRace, p_stCharacter) {

					$scope.emptyCharacter();

					if (p_stRace && p_stRace.code && p_stCharacter && p_stCharacter.code) {

						$scope.selectedcharacter = p_stCharacter;

						socket.emit('web.warcraftsounds.actions.get', {
							race : $scope.selectedrace.code,
							character : p_stCharacter.code
						});

					}

				};

			// previews

				$scope.previewMusic = function(p_stRace, p_stMusic) {
                    $popup.sound(p_stMusic.url, p_stRace.name + ' - ' + p_stMusic.name);
				};
				$scope.previewWarning = function(p_stRace, p_stWarning) {
                    $popup.sound(p_stWarning.url, p_stRace.name + ' - ' + p_stWarning.name);
				};
                $scope.previewAction = function(p_stRace, p_stCharacter, p_stAction) {
                    $popup.sound(p_stAction.url, p_stRace.name + '/' + p_stCharacter.name + ' - ' + p_stAction.name);
                };

			// plays

				$scope.playMusicOnChild = function(p_stMusic, p_stChild) {

					socket.emit('web.warcraftsounds.music.play', {
						child : p_stChild, music : p_stMusic
					});

				};
				$scope.playWarningOnChild = function(p_stWarning, p_stChild) {

					socket.emit('web.warcraftsounds.warning.play', {
                        child : p_stChild, warning : p_stWarning
					});

				};
                $scope.playActionOnChild = function(p_stAction, p_stChild) {

                    socket.emit('web.warcraftsounds.action.play', {
                        child : p_stChild, action : p_stAction
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