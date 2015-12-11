
// dépendances
	
// module
	
	module.exports = function (Container) {

		// constructor

			Container.get('server.socket.child')
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.temperature');
				})
				.onConnection(function(socket) {

					socket
						.on('child.temperature', function (data) {
							socket.MIA.temperature = data;
							Container.get('server.socket.web').emit('web.temperature', socket.MIA);
						});

				});

	};