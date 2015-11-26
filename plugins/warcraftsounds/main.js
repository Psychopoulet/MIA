
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
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'warcraftsounds')),
				m_tabData = [];

		// methods

			// private
				
				function _readCache() {
					
					if (fs.existsSync(m_sLocalFile)) {

						try {
							m_tabData = JSON.parse(fs.readFileSync(m_sLocalFile, 'utf8'));
						}
						catch(e) {
							m_clLog.err((e.message) ? e.message : e);
						}

					}

				}

				function _writeCache() {
					try {
						fs.writeFileSync(m_sLocalFile, JSON.stringify(m_tabData), 'utf8');
					}
					catch(e) {
						m_clLog.err((e.message) ? e.message : e);
					}
				}

				function _check(p_clSocket, p_stData) {

					var bResult = true;

						if (!p_stData) {
							m_clLog.err('Missing data');
							p_clSocket.emit('web.warcraftsounds.error', 'Missing data');
						}
						else if (!p_stData.child) {
							m_clLog.err('Missing \'child\' data');
							p_clSocket.emit('web.warcraftsounds.error', 'Missing \'child\' data');
						}
						else if (!p_stData.child.token) {
							m_clLog.err('Missing \'child.token\' data');
							p_clSocket.emit('web.warcraftsounds.error', 'Missing \'child.token\' data');
						}

					return bResult;
					
				}

		// constructor

			// events

				Container.get('server.socket.web')
					.onDisconnect(function(socket) {

						socket.removeAllListeners('web.warcraftsounds.getall');

						socket.removeAllListeners('web.warcraftsounds.action.play');
						socket.removeAllListeners('web.warcraftsounds.music.play');
						socket.removeAllListeners('web.warcraftsounds.warning.play');

					})
					.onConnection(function(socket) {

						socket

							.on('web.warcraftsounds.getall', function () {
								socket.emit('web.warcraftsounds.getall', m_tabData);
							})

							.on('web.warcraftsounds.action.play', function (p_stData) {

								if (_check(socket, p_stData)) {

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

								}

							})
							.on('web.warcraftsounds.music.play', function (p_stData) {

								if (_check(socket, p_stData)) {

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

								}

							})
							.on('web.warcraftsounds.warning.play', function (p_stData) {

								if (_check(socket, p_stData)) {

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

								}

							});

					});

				Container.get('server.socket.child')
					.onDisconnect(function(socket) {
						socket.removeAllListeners('child.sounds.error');
						socket.removeAllListeners('child.sounds.played');
					})
					.onConnection(function(socket) {

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
								"url" : "http://warhuman.voila.net/SoundHuman/Peasant/VF/PeasantReady1_w3.mp3"
							});
							
					});

			// data

				_readCache();

				Container.get('sikyapi').query('warcraftsounds', '/races/complete', 'GET')
					.then(function (p_tabData) {
						m_tabData = p_tabData;
						Container.get('server.socket.web').emit('web.warcraftsounds.getall', m_tabData);
						_writeCache();
					})
					.catch(function (err){
						m_clLog.err(err);
						Container.get('server.socket.web').emit('web.warcraftsounds.error', err);
					});
					
	};