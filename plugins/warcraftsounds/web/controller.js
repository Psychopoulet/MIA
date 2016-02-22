app.controller('ControllerWarcraftSounds', ['$scope', '$popup', function($scope, $popup) {

	"use strict";

	// attributes

		// private
		
			var m_tabRaces = [];

		// public

			$scope.races = [];
				$scope.characters = [];
					$scope.actions = [];
				$scope.musics = [];
				$scope.warnings = [];

			$scope.children = [];
			$scope.selectedchild = false;

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

						m_tabRaces.forEach(function(race) {
								
							if (race.code === p_stRace.code) {

								if (race.characters && 0 < race.characters.length) {
									$scope.characters = race.characters;
								}
								else {
									socket.emit('web.warcraftsounds.characters.get', { race : p_stRace });
								}

								if (race.musics && 0 < race.musics.length) {
									$scope.musics = race.musics;
								}
								else {
									socket.emit('web.warcraftsounds.musics.get', { race : p_stRace });
								}

								if (race.warnings && 0 < race.warnings.length) {
									$scope.warnings = race.warnings;
								}
								else {
									socket.emit('web.warcraftsounds.warnings.get', { race : p_stRace });
								}

							}
							
						});
						
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

						m_tabRaces.forEach(function(race) {
								
							if (race.code === p_stRace.code) {

								race.characters.forEach(function(character) {

									if (character.code === p_stCharacter.code) {

										if (character.actions && 0 < character.actions.length) {
											$scope.actions = character.actions;
										}
										else {
											
											socket.emit('web.warcraftsounds.actions.get', {
												race : p_stRace,
												character : p_stCharacter
											});

										}

									}

								});

							}
							
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

		    socket.on('childs', function (childs) {

				$scope.children = childs;
				$scope.selectedchild = false;
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

								if (0 < m_tabRaces.length) {
									$scope.races = m_tabRaces;
									$scope.$apply();
								}
								else {
									socket.emit('web.warcraftsounds.races.get');
								}

							})
							.on('web.warcraftsounds.races.get', function (p_tabData) {

								m_tabRaces = p_tabData;

								$scope.races = p_tabData;
								$scope.$apply();

							})
							.on('web.warcraftsounds.characters.get', function (p_stData) {

								m_tabRaces.forEach(function(race, key) {
										
									if (race.code === p_stData.race.code) {
										m_tabRaces[key].characters = p_stData.characters;
									}
									
								});
								
								$scope.characters = p_stData.characters;
								$scope.$apply();

							})
								.on('web.warcraftsounds.actions.get', function (p_stData) {

									m_tabRaces.forEach(function(race, racekey) {
										
										if (race.code === p_stData.race.code) {

											race.characters.forEach(function(character, characterkey) {
												
												if (character.code === p_stData.character.code) {
													m_tabRaces[racekey].characters[characterkey].actions = p_stData.actions;
												}
												
											});

										}
										
									});
								
									$scope.actions = p_stData.actions;
									$scope.$apply();

								})
							.on('web.warcraftsounds.musics.get', function (p_stData) {

								m_tabRaces.forEach(function(race, key) {
										
									if (race.code === p_stData.race.code) {
										m_tabRaces[key].musics = p_stData.musics;
									}
									
								});
								
								$scope.musics = p_stData.musics;
								$scope.$apply();

							})
							.on('web.warcraftsounds.warnings.get', function (p_stData) {

								m_tabRaces.forEach(function(race, key) {
										
									if (race.code === p_stData.race.code) {
										m_tabRaces[key].warnings = p_stData.warnings;
									}
									
								});
								
								$scope.warnings = p_stData.warnings;
								$scope.$apply();

							})
							.on('web.warcraftsounds.error', $popup.alert);

					});

}]);
