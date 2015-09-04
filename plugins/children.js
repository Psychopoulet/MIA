
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'children'));
				
		// constructor

			p_clHTTPSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('child.getconnected');
				socket.removeAllListeners('child.youtube.play');
			});

			p_clHTTPSocket.onConnection(function(socket) {

				socket

					.on('child.getconnected', function () {
						p_clHTTPSocket.emit('child.getconnected', p_clChildSocket.getConnectedChilds());
					})
					
					.on('child.youtube.play', function (data) {

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

					});

			});

			p_clChildSocket.onDisconnect(function(socket) {

				socket.removeAllListeners('w3.error');
				socket.removeAllListeners('child.temperature');
				socket.removeAllListeners('child.youtube.error');
				socket.removeAllListeners('child.youtube.played');

				p_clHTTPSocket.emit('child.disconnected', socket.MIA);

			});

			p_clChildSocket.onConnection(function(socket) {

				socket

					.on('child.temperature', function (data) {
						socket.MIA.temperature = data;
						p_clHTTPSocket.emit('child.temperature', socket.MIA);
					})

					.on('child.youtube.played', function (error) {
						p_clChildSocket.emit('child.youtube.played');
					})
					.on('child.youtube.error', function (error) {
						p_clChildSocket.emit('child.youtube.error', data.url);
						m_clLog.err(error);
					})

					.on('w3.error', function (message) {
						m_clLog.err(message);
					})
					.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
					
				p_clHTTPSocket.emit('child.connection', socket.MIA);

			});

	};