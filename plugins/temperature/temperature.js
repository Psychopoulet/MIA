
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// constructor

			p_clChildSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.temperature');
				})
				.onConnection(function(socket) {

					socket
						.on('child.temperature', function (data) {
							socket.MIA.temperature = data;
							p_clHTTPSocket.emit('web.temperature', socket.MIA);
						});

				});

	};