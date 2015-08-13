
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_HTTP = require('http'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_MKDirP = require('mkdirp'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js'));
		
// module
	
	module.exports = function () {

		// attributes

			var m_tabActions = [

				{ name: 'ready', codes : [ 'Ready1' ] },
				{ name: 'warcry', code : [ 'Warcry1' ] },
				{ name: 'what', codes : [ 'What1', 'What2', 'What3', 'What4' ] },
				{ name: 'yes', codes : [ 'Yes1', 'Yes2', 'Yes3', 'Yes4' ] },
				{ name: 'attack', codes : [ 'Attack1', 'Attack2', 'Attack3' ] },
				{ name: 'fun', codes : [ 'Pissed1', 'Pissed2', 'Pissed3', 'Pissed4', 'Pissed5', 'Pissed6' ] },
				{ name: 'death', codes : [ 'Death' ] }

			];
			
			var m_tabRaces = [

				{
					name : 'human',
					characters : [
						'Hero_Paladin'
					]
				},
				{
					name : 'orc',
					characters : [
						'Hero_Blade_Master',
						'Hero_Tauren_Chieftain'
					]
				},
				{
					name : 'elf',
					characters : [
						'Hero_Demon_Hunter'
					]
				},
				{
					name : 'undead',
					characters : [
						'Hero_Lich'
					]
				}

			];
				
			var m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'W3VoicesManager'));
				
		// methodes
			
			// protected

				function _dataToFilePath(p_sRace, p_sCharacter, p_sAction) {
					return CST_DEP_Path.join(__dirname, '..', 'voices', 'w3', p_sRace, p_sCharacter, p_sAction + '.mp3');;
				}

				function _isActionValid(p_sAction) {

					var bResult = false;
					
						m_tabActions.every(function (action) {
							if (action.name === p_sAction) {
								bResult = true;
								return false;
							}
							return true;
						});

					return bResult;

				}

				function _randomedAction(p_sAction) {

					var sUrlAction = '', stAction;

						m_tabActions.every(function (action) {
							if (action.name === p_sAction) {
								stAction = action;
								return false;
							}
							return true;
						});

					return stAction.codes[Math.floor(Math.random() * stAction.codes.length)];

				}

				function _isRaceValid(p_sRace) {

					var bResult = false;
					
						m_tabRaces.every(function (race) {
							if (race.name === p_sRace) {
								bResult = true;
								return false;
							}
							return true;
						});

					return bResult;

				}

				function _isCharacterValid(p_sRace, p_sCharacter) {

					var bResult  = false;

						m_tabRaces.every(function (race) {

							if (race.name === p_sRace) {

								race.characters.every(function (character) {

									if (character === p_sCharacter) {
										bResult = true;
										return false;
									}
									return true;

								});

								return false;

							}

							return true;

						});

					return bResult;

				}

				function _download (p_sRace, p_sCharacter, p_sUrlAction, p_fCallback) {

					var sUrl, sMP3;

					switch (p_sRace) {

						case 'human' :
							sUrl = 'http://warhuman.voila.net/SoundHuman/';
						break;

						case 'orc' :
							sUrl = 'http://warorc.voila.net/SoundOrc/';
						break;

						case 'elf' :
							sUrl = 'http://warelf.voila.net/SoundNight_Elfs/';
						break;

						case 'undead' :
							sUrl = 'http://warundead.voila.net/SoundUndead/';
						break;

					}

					sUrl += p_sCharacter + '/VF/' + p_sCharacter.replace(/_/g, '') + p_sUrlAction + '_w3.mp3';

					sMP3 = _dataToFilePath(p_sRace, p_sCharacter, p_sUrlAction);

						CST_DEP_MKDirP(CST_DEP_Path.dirname(sMP3), function (err) {

							CST_DEP_HTTP.get(sUrl, function(response) {

					        	var clMP3 = CST_DEP_FileStream.createWriteStream(sMP3);

					        	clMP3.on('open', function (fd) {

					        		response
						        		.on('data', function(chunk) {
					            			clMP3.write(chunk);
								        })
								        .on('end', function() {

				            				clMP3.end();

											if ('function' === typeof p_fCallback) {
												p_fCallback();
											}
										
										});

					        	});

							})
							.on('error', function(e) {
							  	m_clLog.err("Got error: " + e.message);
							});

						});

					return this;

				}

			// public

				this.play = function (p_sRace, p_sCharacter, p_sAction, p_fCallback) {

					var sMP3, sAction;

					if (!_isCharacterValid(p_sRace, p_sCharacter)) {

						if (!_isRaceValid(p_sRace)) {
							m_clLog.err('mauvaise race');
						}
						else {
							m_clLog.err('mauvais personnage');
						}
						
					}
					else if (!_isActionValid(p_sAction)) {
						m_clLog.err('mauvaise action');
					}
					else {

						sUrlAction = _randomedAction(p_sAction);

						sMP3 = _dataToFilePath(p_sRace, p_sCharacter, sUrlAction);

						if (!CST_DEP_FileStream.existsSync(sMP3)) {

							_download(p_sRace, p_sCharacter, sUrlAction, function () {

								var exec = require('child_process').exec;

								exec(sMP3, function(error, stdout, stderr) {

									if ('function' === typeof p_fCallback) {
										p_fCallback();
									}
									
								});

							});

						}
						else {

							var exec = require('child_process').exec;

							exec(sMP3, function(error, stdout, stderr) {
								
								if ('function' === typeof p_fCallback) {
									p_fCallback();
								}
								
							});

						}

					}

					return this;

				};

			this.playRandomCharacter= function (p_sAction, p_fCallback) {

				var stRandomRace, sRandomCharacter;

					stRandomRace = m_tabRaces[Math.floor(Math.random() * m_tabRaces.length)];
					sRandomCharacter = stRandomRace.characters[Math.floor(Math.random() * stRandomRace.characters.length)];

				return this.play(stRandomRace.name, sRandomCharacter, p_sAction, p_fCallback);

			};

	};
	