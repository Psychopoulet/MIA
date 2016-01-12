
// dépendances
	
	var
		path = require('path'),
		fs = require('fs'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_sLocalFile = path.join(__dirname, 'backup.json'),
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'warcraftsounds'));

		// constructor

			// events

				Container.get('server.socket.web')
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
										Container.get('server.socket.web').emit('web.warcraftsounds.races.get', p_tabData);
									})
									.catch(function (err){
										m_clLog.err(err);
										Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
									});

							})
								.on('web.warcraftsounds.characters.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('server.socket.web').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/characters', 'GET')
											.then(function (p_tabData) {

												Container.get('server.socket.web').emit('web.warcraftsounds.characters.get', {
													race : p_stData.race,
													characters : p_tabData
												});

											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
											});

									}

								})
									.on('web.warcraftsounds.actions.get', function (p_stData) {

										if (!p_stData.race || !p_stData.race.code) {
											Container.get('server.socket.web').emit('web.warcraftsounds.error', 'Missing race code.');
										}
										else if (!p_stData.character || !p_stData.character.code) {
											Container.get('server.socket.web').emit('web.warcraftsounds.error', 'Missing character code.');
										}
										else {

											Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/characters/' + p_stData.character.code + '/actions', 'GET')
												.then(function (p_tabData) {

													Container.get('server.socket.web').emit('web.warcraftsounds.actions.get', {
														race : p_stData.race,
														character : p_stData.character,
														actions : p_tabData
													});

												})
												.catch(function (err){
													m_clLog.err(err);
													Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
												});

										}

									})
								.on('web.warcraftsounds.musics.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('server.socket.web').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/musics', 'GET')
											.then(function (p_tabData) {

												Container.get('server.socket.web').emit('web.warcraftsounds.musics.get', {
													race : p_stData.race,
													musics : p_tabData
												});

											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
											});

									}

								})
								.on('web.warcraftsounds.warnings.get', function (p_stData) {

									if (!p_stData.race || !p_stData.race.code) {
										Container.get('server.socket.web').emit('web.warcraftsounds.error', 'Missing race code.');
									}
									else {

										Container.get('sikyapi').query('warcraftsounds', '/races/' + p_stData.race.code + '/warnings', 'GET')
											.then(function (p_tabData) {
												
												Container.get('server.socket.web').emit('web.warcraftsounds.warnings.get', {
													race : p_stData.race,
													warnings : p_tabData
												});

											})
											.catch(function (err){
												m_clLog.err(err);
												Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
											});

									}

								})

							.on('web.warcraftsounds.action.play', function (p_stData) {

								if (!p_stData.action) {
									m_clLog.err('Missing \'action\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'action\' data');
								}
								else if (!p_stData.action.url) {
									m_clLog.err('Missing \'action.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'action.url\' data');
								}
								else {
									Container.get('server.socket.child').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.action);
								}
									
							})
							.on('web.warcraftsounds.music.play', function (p_stData) {

								if (!p_stData.music) {
									m_clLog.err('Missing \'music\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'music\' data');
								}
								else if (!p_stData.music.url) {
									m_clLog.err('Missing \'music.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'music.url\' data');
								}
								else {
									m_clLog.log('web.warcraftsounds.music.play : ' + p_stData.music.name);
									Container.get('server.socket.child').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.music);
								}

							})
							.on('web.warcraftsounds.warning.play', function (p_stData) {

								if (!p_stData.warning) {
									m_clLog.err('Missing \'warning\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'warning\' data');
								}
								else if (!p_stData.warning.url) {
									m_clLog.err('Missing \'warning.url\' data');
									socket.emit('web.warcraftsounds.error', 'Missing \'warning.url\' data');
								}
								else {
									m_clLog.log('web.warcraftsounds.warning.play : ' + p_stData.warning.name);
									Container.get('server.socket.child').emitTo(p_stData.child.token, 'child.sounds.play', p_stData.warning);
								}

							});

					});

				Container.get('server.socket.child')
					.onDisconnect(function(socket) {
						socket.removeAllListeners('child.sounds.error');
						socket.removeAllListeners('child.sounds.played');
					})
					.onLog(function(socket) {

						socket

							.on('child.sounds.error', function (error) {
								m_clLog.err(error);
								Container.get('server.socket.web').emit('child.sounds.error', error);
							})
							.on('child.sounds.played', function (p_stData) {
								Container.get('server.socket.web').emit('child.sounds.played', p_stData);
							})

							.emit('child.sounds.play', {
								"path" : "/humans/peasant/ready",
								"name" : "ready",
								"url" : "https://siky.fr/warcraftsounds/sounds/humans/actions/peasant/ready/ready1.mp3"
							});
							
					});

	};