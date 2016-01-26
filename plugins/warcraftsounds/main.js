
// dépendances
	
	var
		path = require('path'),
		fs = require('fs');

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_sLocalFile = path.join(__dirname, 'backup.json');

		// constructor

			// events

				Container.get('websockets')
					.onDisconnect(function(socket) {

						socket.removeAllListeners('web.warcraftsounds.races.get');
							socket.removeAllListeners('web.warcraftsounds.characters.get');
								socket.removeAllListeners('web.warcraftsounds.actions.get');
							socket.removeAllListeners('web.warcraftsounds.musics.get');
							socket.removeAllListeners('web.warcraftsounds.warnings.get');

						socket.removeAllListeners('web.warcraftsounds.action.play');
						socket.removeAllListeners('web.warcraftsounds.music.play');
						socket.removeAllListeners('web.warcraftsounds.warning.play');

					})
					.onLog(function(socket) {

						socket

							.on('web.warcraftsounds.races.get', function () {

								Container.get('sikyapi').query('warcraftsounds', '/races', 'GET')
									.then(function (p_tabData) {
										Container.get('websockets').emit('web.warcraftsounds.races.get', p_tabData);
									})
									.catch(function (err){
										Container.get('logs').err(err);
										Container.get('websockets').emit('web.warcraftsounds.error', err);
									});

							})
								.on('web.warcraftsounds.characters.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('websockets').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/characters', 'GET')
											.then(function (p_tabData) {

												Container.get('websockets').emit('web.warcraftsounds.characters.get', {
													race : p_stData.race,
													characters : p_tabData
												});

											})
											.catch(function (err){
												Container.get('logs').err(err);
												Container.get('websockets').emit('web.warcraftsounds.error', err);
											});

									}

								})
									.on('web.warcraftsounds.actions.get', function (p_stData) {

										if (!p_stData.race || !p_stData.race.code) {
											Container.get('websockets').emit('web.warcraftsounds.error', 'Missing race code.');
										}
										else if (!p_stData.character || !p_stData.character.code) {
											Container.get('websockets').emit('web.warcraftsounds.error', 'Missing character code.');
										}
										else {

											Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/characters/' + p_stData.character.code + '/actions', 'GET')
												.then(function (p_tabData) {

													Container.get('websockets').emit('web.warcraftsounds.actions.get', {
														race : p_stData.race,
														character : p_stData.character,
														actions : p_tabData
													});

												})
												.catch(function (err){
													Container.get('logs').err(err);
													Container.get('websockets').emit('web.warcraftsounds.error', err);
												});

										}

									})
								.on('web.warcraftsounds.musics.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('websockets').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/musics', 'GET')
											.then(function (p_tabData) {

												Container.get('websockets').emit('web.warcraftsounds.musics.get', {
													race : p_stData.race,
													musics : p_tabData
												});

											})
											.catch(function (err){
												Container.get('logs').err(err);
												Container.get('websockets').emit('web.warcraftsounds.error', err);
											});

									}

								})
								.on('web.warcraftsounds.warnings.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('websockets').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/warnings', 'GET')
											.then(function (p_tabData) {
												
												Container.get('websockets').emit('web.warcraftsounds.warnings.get', {
													race : p_stData.race,
													warnings : p_tabData
												});

											})
											.catch(function (err){
												Container.get('logs').err(err);
												Container.get('websockets').emit('web.warcraftsounds.error', err);
											});

									}

								})

							.on('web.warcraftsounds.action.play', function (p_stData) {

								if (!p_stData.action) {
									Container.get('logs').err('Missing \'action\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'action\' data');
								}
								else if (!p_stData.action.url) {
									Container.get('logs').err('Missing \'action.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'action.url\' data');
								}
								else {
									Container.get('childssockets').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.action);
								}
									
							})
							.on('web.warcraftsounds.music.play', function (p_stData) {

								if (!p_stData.music) {
									Container.get('logs').err('Missing \'music\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'music\' data');
								}
								else if (!p_stData.music.url) {
									Container.get('logs').err('Missing \'music.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'music.url\' data');
								}
								else {
									Container.get('logs').log('web.warcraftsounds.music.play : ' + p_stData.music.name);
									Container.get('childssockets').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.music);
								}

							})
							.on('web.warcraftsounds.warning.play', function (p_stData) {

								if (!p_stData.warning) {
									Container.get('logs').err('Missing \'warning\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'warning\' data');
								}
								else if (!p_stData.warning.url) {
									Container.get('logs').err('Missing \'warning.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'warning.url\' data');
								}
								else {
									Container.get('logs').log('web.warcraftsounds.warning.play : ' + p_stData.warning.name);
									Container.get('childssockets').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.warning);
								}

							});

					});

				Container.get('childssockets')
					.onDisconnect(function(socket) {
						socket.removeAllListeners('child.sounds.error');
						socket.removeAllListeners('child.sounds.played');
					})
					.onLog(function(socket) {

						socket

							.on('child.sounds.error', function (error) {
								Container.get('logs').err(error);
								Container.get('websockets').emit('child.sounds.error', error);
							})
							.on('child.sounds.played', function (p_stData) {
								Container.get('websockets').emit('child.sounds.played', p_stData);
							})

							.emit('child.sounds.play', {
								"path" : "/humans/peasant/ready",
								"name" : "ready",
								"url" : "https://siky.fr/warcraftsounds/sounds/humans/actions/peasant/ready/ready1.mp3"
							});
							
					});

	};