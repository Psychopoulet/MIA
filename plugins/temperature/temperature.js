
// dépendances
	
// module
	
	module.exports = function (Factory) {

		// constructor

			Factory.getChildSocketInstance()
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.temperature');
				})
				.onConnection(function(socket) {

					socket
						.on('child.temperature', function (data) {
							socket.MIA.temperature = data;
							Factory.getHTTPSocketInstance().emit('web.temperature', socket.MIA);
						});

				});

	};