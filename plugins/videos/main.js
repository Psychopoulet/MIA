
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
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos')),
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

		// constructor

			// events

				Container.get('server.socket.web')
					.onDisconnect(function(socket) {
						socket.removeAllListeners('web.videos.play');
						socket.removeAllListeners('web.videos.getall');
					})
					.onConnection(function(socket) {

						socket
							.on('web.videos.play', function (data) {

								if (!data) {
									m_clLog.err('Missing data');
									socket.emit('web.videos.error', 'Missing data');
								}
								else if (!data.token) {
									m_clLog.err('Missing \'token\' data');
									socket.emit('web.videos.error', 'Missing \'token\' data');
								}
								else if (!data.video) {
									m_clLog.err('Missing \'video\' data');
									socket.emit('web.videos.error', 'Missing \'video\' data');
								}
								else {
									console.log(data.token);
									console.log(data.video);
									Container.get('server.socket.child').emitTo(data.token, 'child.videos.play', data.video);
								}

							})
							.on('web.videos.getall', function () {
								m_clLog.log('web.videos.getall');
								socket.emit('web.videos.getall', m_tabData);
							});

					});

				Container.get('server.socket.child')
					.onDisconnect(function(socket) {

						socket.removeAllListeners('child.videos.error');
						socket.removeAllListeners('child.videos.played');

						Container.get('server.socket.web').emit('child.disconnected', socket.MIA);

					})
					.onConnection(function(socket) {

						socket
							.on('child.videos.error', function (error) {
								m_clLog.err(error);
								Container.get('server.socket.child').emit('child.videos.error', error);
							})
							.on('child.videos.played', function () {
								m_clLog.log('child.videos.played');
								Container.get('server.socket.child').emit('child.videos.played');
							});

					});

			// data

				_readCache();

				Container.get('sikyapi').onLogin(function() {
					
					Container.get('sikyapi').query('videos', 'videos', 'GET')
						.then(function (p_tabData) {
							m_tabData = p_tabData;
							Container.get('server.socket.web').emit('web.videos.getall', m_tabData);
							m_clLog.log('web.videos.getall');
							_writeCache();
						})
						.catch(function (err){
							m_clLog.err(err);
							Container.get('server.socket.web').emit('web.videos.error', err);
						});

				});

	};