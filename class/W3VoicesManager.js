
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_HTTP = require('http'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js'));
		
// module
	
	module.exports = function () {

		// attributes
			
			var m_stRaces = [

				{
					name : 'human',
					characters : [
						'Hero_Paladin'
					]
				},
				{
					name : 'orc',
					characters : [
						'Hero_Blade_Master'
					]
				},
				{
					name : 'elf',
					characters : [

					]
				},
				{
					name : 'undead',
					characters : [

					]
				}

			];
				
			var m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'W3VoicesManager'));
				
		// methodes
			
			// protected

				function _dataToFilePath(p_sRace, p_sCharacter, p_sAction) {
					return CST_DEP_Path.join(__dirname, '..', 'test.mp3');
					return CST_DEP_Path.join(__dirname, '..', 'voices', 'w3', p_sRace, p_sCharacter, p_sAction + '.mp3');;
				}

				function _isRaceValid(p_sRace) {

					var bResult = false;
					
						m_stRaces.every(function (race) {
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

						m_stRaces.every(function (race) {

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

			// public

				this.download = function (p_sRace, p_sCharacter, p_sAction, p_fCallback) {

					var sUrl, sMP3;

					if (!_isCharacterValid(p_sRace, p_sCharacter)) {

						if (!_isRaceValid(p_sRace)) {
							m_clLog.err('mauvaise race');
						}
						else {
							m_clLog.err('mauvais personnage');
						}
						
					}
					else {

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

						sUrl += p_sCharacter + '/VF/' + p_sCharacter.replace(/_/g, '') + p_sAction + '1_w3.mp3';
						sMP3 = _dataToFilePath(p_sRace, p_sCharacter, p_sAction);

						CST_DEP_HTTP
							.get(sUrl, function(response) {

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

					}

					return this;

				};

				this.play = function (p_sRace, p_sCharacter, p_sAction, p_fCallback) {

					var sMP3;

					if (!_isCharacterValid(p_sRace, p_sCharacter)) {

						if (!_isRaceValid(p_sRace)) {
							m_clLog.err('mauvaise race');
						}
						else {
							m_clLog.err('mauvais personnage');
						}
						
					}
					else {

						sMP3 = _dataToFilePath(p_sRace, p_sCharacter, p_sAction);

						if (!CST_DEP_FileStream.existsSync(sMP3)) {

							this.download(p_sRace, p_sCharacter, p_sAction, function () {

								console.log(sMP3);

								var exec = require('child_process').exec;

								exec(sMP3, function(error, stdout, stderr) {
									p_fCallback();
								});

							});

						}
						else {

								console.log(sMP3);

							var exec = require('child_process').exec;

							exec(sMP3, function(error, stdout, stderr) {
								p_fCallback();
							});

						}

					}

				};

	};
	