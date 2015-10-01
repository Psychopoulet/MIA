
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

		// methods

			// private
				
				function _err(err) {

					if(err.message) {
						err = err.message;
					}

					m_clLog.err(err);
					p_clHTTPSocket.emit('child.warcraftsounds.error', err);
					
				}

				function _checkChild(p_clSocket, p_stData) {

					var bResult = false;

						if (!p_stData) {
							m_clLog.err('Missing data');
							p_clSocket.emit('child.warcraftsounds.error', 'Missing data');
						}
						else if (!p_stData.url) {
							m_clLog.err('Missing \'url\' data');
							p_clSocket.emit('child.warcraftsounds.error', 'Missing \'url\' data');
						}
						else {
							bResult = true;
						}

					return bResult;
					
				}

				function _checkData(p_clSocket, p_stData) {

					var bResult = true;

						if (!p_stData.child) {
							m_clLog.err('Missing \'child\' data');
							p_clSocket.emit('child.warcraftsounds.error', 'Missing \'child\' data');
						}
						else if (!p_stData.url) {
							m_clLog.err('Missing \'url\' data');
							p_clSocket.emit('child.warcraftsounds.error', 'Missing \'url\' data');
						}

					return bResult;
					
				}

		// constructor

			// events

				p_clHTTPSocket
					.onDisconnect(function(socket) {

						socket.removeAllListeners('child.warcraftsounds.getall');

						socket.removeAllListeners('child.warcraftsounds.play.action');
						socket.removeAllListeners('child.warcraftsounds.play.music');
						socket.removeAllListeners('child.warcraftsounds.play.warning');

					})
					.onConnection(function(socket) {

						socket

							.on('child.warcraftsounds.getall', function () {
								socket.emit('child.warcraftsounds.getall', m_tabData);
							})

							.on('child.warcraftsounds.play.warning', function (p_stData) {

								if (_checkData(socket, p_stData) && _checkChild(socket, p_stData) && _checkData(socket, p_stData)) {
									m_clLog.err('Missing data');
									socket.emit('child.warcraftsounds.error', 'Missing data');
								}
								else if (!p_stData.child) {
									m_clLog.err('Missing \'child\' data');
									socket.emit('child.warcraftsounds.error', 'Missing \'child\' data');
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
						socket.removeAllListeners('child.warcraftsounds.error');
						socket.removeAllListeners('child.warcraftsounds.played');
					})
					.onConnection(function(socket) {

						socket

							.on('child.warcraftsounds.error', function (error) {
								m_clLog.err(error);
								p_clChildSocket.emit('child.warcraftsounds.error', error);
							})
							.on('child.warcraftsounds.played', function (p_stData) {
								m_clLog.success('child.warcraftsounds.played');
								p_clChildSocket.emit('child.warcraftsounds.played', p_stData);
							})

							.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
							
					});

			// data

				p_clSikyAPI.query('warcraftsounds', '/races/complete', 'GET')
					.then(function (p_tabRaces) {
						m_tabData = p_tabRaces;
					})
					.catch(_err);
					
	};