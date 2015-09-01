
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// constructor

			p_clChildSocket.onConnection(function(socket) {
				p_clHTTPSocket.emit('child.connected', {});
			});

	};
