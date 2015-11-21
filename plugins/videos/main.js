
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

				function _loadFormSIKY() {

					Container.get('sikyapi').onLogin(function() {

						Container.get('sikyapi').query('videos', 'videos', 'GET')
							.then(function (p_tabData) {
								m_tabData = p_tabData;
								_writeCache();
								Container.get('server.socket.web').emit('web.videos.getall', m_tabData);
								m_clLog.log('web.videos.getall');
							})
							.catch(function (err){
								m_clLog.err(err);
								Container.get('server.socket.web').emit('web.videos.error', err);
							});

					});

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
						
							.on('web.videos.add', function (data) {

								m_tabData.push(data);
								_writeCache();
								Container.get('server.socket.web').emit('web.videos.getall', m_tabData);
								
								Container.get('sikyapi').query('videos', 'videos', 'POST')
									.then(_loadFormSIKY)
									.catch(function (err){
										m_clLog.err(err);
										Container.get('server.socket.web').emit('web.videos.error', err);
									});

							})
							.on('web.videos.edit', function (data) {

								for (var i = 0, l = m_tabData.length; i < l; ++i) {

									if (data.id == m_tabData[i].id) {
										m_tabData[i] = data;
										break;
									}

								}

								_writeCache();
								Container.get('server.socket.web').emit('web.videos.getall', m_tabData);

								Container.get('sikyapi').query('videos', 'videos/' + data.id, 'PUT')
									.then(_loadFormSIKY)
									.catch(function (err){
										m_clLog.err(err);
										Container.get('server.socket.web').emit('web.videos.error', err);
									});

							})
							.on('web.videos.delete', function (data) {

								for (var i = 0, l = m_tabData.length; i < l; ++i) {

									if (data.id == m_tabData[i].id) {
										m_tabData.slice(i, 1);
										break;
									}

								}

								_writeCache();
								Container.get('server.socket.web').emit('web.videos.getall', m_tabData);

								Container.get('sikyapi').query('videos', 'videos/' + data.id, 'DELETE')
									.then(_loadFormSIKY)
									.catch(function (err){
										m_clLog.err(err);
										Container.get('server.socket.web').emit('web.videos.error', err);
									});

							})

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
									Container.get('server.socket.child').emitTo(data.token, 'child.videos.play', data.video);
								}

							})

							.on('web.videos.getall', function () {
								socket.emit('web.videos.getall', m_tabData);
							});

					});

				Container.get('server.socket.child')
					.onDisconnect(function(socket) {

						socket.removeAllListeners('child.videos.error');
						socket.removeAllListeners('child.videos.played');
						socket.removeAllListeners('child.videos.downloaded');

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
							})
							.on('child.videos.downloaded', function (video) {
								m_clLog.log('child.videos.downloaded');
								Container.get('server.socket.child').emit('child.videos.downloaded', video);
							});

					});

			// data

				_readCache();
				_loadFormSIKY();

	};