
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {
		
		// attributes
			
			var
				tabHTTPSockets = [];
			
		// constructor

			p_clHTTPSocket.onConnection(function(socket) {
				
				tabHTTPSockets.push(socket);
				
				socket
					.on('disconnect', function () {
						
						tabHTTPSockets.forEach(function(value, key) {
							
							if (value.id === socket.id) {
								tabHTTPSockets.splice(key, 1);
							}
							
						});
						
					});
					
			});

			p_clChildSocket.onConnection(function(socket) {

				socket.removeAllListeners('token_get');

				socket
					.on('temperature', function (data) {
						
						tabHTTPSockets.forEach(function (HTTPSocket) {
							HTTPSocket.emit('temperature', data);
						});
						
					});
					
			});

	};