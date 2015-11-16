
// dépendances
	
// module
	
	module.exports = function (Container) {

		// constructor

			Container.getChildSocketInstance()
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.temperature');
				})
				.onConnection(function(socket) {

					socket
						.on('child.temperature', function (data) {
							socket.MIA.temperature = data;
							Container.getHTTPSocketInstance().emit('web.temperature', socket.MIA);
						});

				});

	};