
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'youtube'));
				
		// constructor

			p_clHTTPSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('youtube.play');
			});

			p_clHTTPSocket.onConnection(function(socket) {

				socket.on('youtube.play', function (data) {

					if (!data) {
						socket.emit('youtube.error', 'Missing data');
					}
					else if (!data.token) {
						socket.emit('youtube.error', 'Missing \'token\' data');
					}
					else if (!data.url) {
						socket.emit('youtube.error', 'Missing \'url\' data');
					}
					else {
						p_clChildSocket.emitTo(data.token, 'youtube.play', data.url);
					}

				});
				
			});

			p_clChildSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('youtube.error');
			});

			p_clChildSocket.onConnection(function(socket) {

				socket.on('youtube.error', function (error) {
					p_clChildSocket.emit('youtube.error', data.url);
					m_clLog.err(error);
				});
				
			});

	};
