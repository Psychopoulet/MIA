
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {
		
		// constructor

			p_clChildSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('token_get');
			});

			p_clChildSocket.onConnection(function(socket) {

				socket
					.on('temperature', function (data) {
						p_clHTTPSocket.emit('temperature', data);
					});
					
			});

	};
