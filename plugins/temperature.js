
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		p_clChildSocket.onConnection(function(socket) {

			socket.on('temperature', function (data) {
				console.log(data);
			});
			
		});

	};
