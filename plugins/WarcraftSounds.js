
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Log = require('logs'),
		CST_DEP_W3VoicesManager = require('W3VoicesManager');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket, p_clSikyAPI) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'warcraftsounds')),
				m_clW3VoicesManager = new CST_DEP_W3VoicesManager(),f
				m_tabData = [];
				
		// constructor


			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.warcraftsounds.getall');
					socket.removeAllListeners('child.warcraftsounds.play');
				})
				.onConnection(function(socket) {

					socket
						.on('child.warcraftsounds.getall', function () {
							socket.emit('child.warcraftsounds.getall', m_tabData);
						})
						.on('child.warcraftsounds.play', function (p_stData) {

							if (!p_stData) {
								m_clLog.err('Missing data');
								socket.emit('child.warcraftsounds.error', 'Missing data');
							}
							else if (!p_stData.token) {
								m_clLog.err('Missing \'token\' data');
								socket.emit('child.warcraftsounds.error', 'Missing \'token\' data');
							}
							else if (!p_stData.url) {
								m_clLog.err('Missing \'url\' data');
								socket.emit('child.warcraftsounds.error', 'Missing \'url\' data');
							}
							else {
								p_clChildSocket.emitTo(p_stData.token, 'child.youtube.play', p_stData.url);
							}

						});

				});


			p_clChildSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('w3.error');
				})
				.onConnection(function(socket) {

					socket

						.on('w3.error', function (error) {
							m_clLog.err(error);
							p_clChildSocket.emit('child.warcraftsounds.error', error);
						})

						.on('child.youtube.error', function (error) {
							m_clLog.err(error);
							p_clChildSocket.emit('child.warcraftsounds.error', data.url);
						})
						.on('child.youtube.played', function () {
							m_clLog.success('child.warcraftsounds.played');
							p_clChildSocket.emit('child.warcraftsounds.played');
						})

						.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
						
				});


			function _err(err) {

				if(err.message) {
					err = err.message;
				}

				m_clLog.err(err);

				socket.emit('w3.error', err);
			}

			p_clSikyAPI.query('warcraftsounds', '/races/complete', 'GET')
				.then(function (p_tabRaces) {
					m_tabData = p_tabRaces;
				})
				.catch(_err);
				
	};