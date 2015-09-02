
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// constructor

			p_clHTTPSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('child.getconnected');
			});

			p_clHTTPSocket.onConnection(function(socket) {

				socket.on('child.getconnected', function () {
					p_clHTTPSocket.emit('child.getconnected', p_clChildSocket.getConnectedChilds());
				});

			});

			p_clChildSocket.onDisconnect(function(socket) {
				p_clHTTPSocket.emit('child.disconnected', socket.MIA);
			});

			p_clChildSocket.onConnection(function(socket) {
				p_clHTTPSocket.emit('child.connection', socket.MIA);
			});

	};
