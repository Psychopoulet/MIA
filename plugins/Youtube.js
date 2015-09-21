
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_W3VoicesManager = require('W3VoicesManager');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'youtube'));
				
		// constructor

			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.youtube.play');
					socket.removeAllListeners('child.youtube.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('child.youtube.play', function (data) {

							m_clLog.log('child.youtube.play');

							if (!data) {
								socket.emit('child.youtube.error', 'Missing data');
							}
							else if (!data.token) {
								socket.emit('child.youtube.error', 'Missing \'token\' data');
							}
							else if (!data.url) {
								socket.emit('child.youtube.error', 'Missing \'url\' data');
							}
							else {
								p_clChildSocket.emitTo(data.token, 'child.youtube.play', data.url);
							}

						})
						.on('child.youtube.getall', function () {

							m_clLog.log('child.youtube.getall');
							socket.emit('child.youtube.getall', [{ id: 1, name: 'test', url: 'https://www.youtube.com/embed/ms_ZcfSvcJA' }]);

						});

				});

			p_clChildSocket
				.onDisconnect(function(socket) {

					socket.removeAllListeners('child.youtube.error');
					socket.removeAllListeners('child.youtube.played');

					p_clHTTPSocket.emit('child.disconnected', socket.MIA);

				})
				.onConnection(function(socket) {

					socket
						.on('child.youtube.played', function (error) {
							m_clLog.log('child.youtube.played');
							p_clChildSocket.emit('child.youtube.played');
						})
						.on('child.youtube.error', function (error) {
							m_clLog.log('child.youtube.error');
							p_clChildSocket.emit('child.youtube.error', data.url);
							m_clLog.err(error);
						});
						
					p_clHTTPSocket.emit('child.connection', socket.MIA);

				});

	};