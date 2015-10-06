
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

			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.youtube.play');
					socket.removeAllListeners('child.youtube.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('child.youtube.play', function (data) {

							if (!data) {
								m_clLog.err('Missing data');
								socket.emit('child.youtube.error', 'Missing data');
							}
							else if (!data.token) {
								m_clLog.err('Missing \'token\' data');
								socket.emit('child.youtube.error', 'Missing \'token\' data');
							}
							else if (!data.url) {
								m_clLog.err('Missing \'url\' data');
								socket.emit('child.youtube.error', 'Missing \'url\' data');
							}
							else {
								p_clChildSocket.emitTo(data.token, 'child.youtube.play', data.url);
							}

						})
						.on('child.youtube.getall', function () {
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
						.on('child.youtube.error', function (error) {
							m_clLog.err(error);
							p_clChildSocket.emit('child.youtube.error', error);
						})
						.on('child.youtube.played', function () {
							m_clLog.success('child.youtube.played');
							p_clChildSocket.emit('child.youtube.played');
						});
						
					p_clHTTPSocket.emit('child.connection', socket.MIA);

				});

	};