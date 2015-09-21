
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Log = require('logs'),
		CST_DEP_W3VoicesManager = require('W3VoicesManager');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'warcraftsounds')),
				m_clW3VoicesManager = new CST_DEP_W3VoicesManager();
				
		// constructor

			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.warcraftsounds.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('child.warcraftsounds.getall', function () {

							m_clLog.log('child.warcraftsounds.getall');
							socket.emit('child.warcraftsounds.getall', m_clW3VoicesManager.getAllData());

						});

				});

			p_clChildSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('w3.error');
				})
				.onConnection(function(socket) {

					socket
						.on('w3.error', function (message) {
							m_clLog.log('w3.error');
							m_clLog.err(message);
						})
						.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
						
				});

	};