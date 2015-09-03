
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {
		
		// constructor

			p_clChildSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('temperature');
			});

			p_clChildSocket.onConnection(function(socket) {

				socket
					.on('temperature', function (data) {
						socket.MIA.temperature = data;
						p_clHTTPSocket.emit('temperature', socket.MIA);
					});
					
			});

	};
