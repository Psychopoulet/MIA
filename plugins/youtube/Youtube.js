
// dépendances
	
	var
		path = require('path'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'youtube'));
				
		// constructor

			Container.getHTTPSocketInstance()
				.onDisconnect(function(socket) {
					socket.removeAllListeners('web.youtube.play');
					socket.removeAllListeners('web.youtube.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('web.youtube.play', function (data) {

							if (!data) {
								m_clLog.err('Missing data');
								socket.emit('web.youtube.error', 'Missing data');
							}
							else if (!data.token) {
								m_clLog.err('Missing \'token\' data');
								socket.emit('web.youtube.error', 'Missing \'token\' data');
							}
							else if (!data.url) {
								m_clLog.err('Missing \'url\' data');
								socket.emit('web.youtube.error', 'Missing \'url\' data');
							}
							else {
								Container.getChildSocketInstance().emitTo(data.token, 'child.youtube.play', data.url);
							}

						})
						.on('web.youtube.getall', function () {
							socket.emit('web.youtube.getall', [{ id: 1, name: 'test', url: 'https://www.youtube.com/embed/ms_ZcfSvcJA' }]);
						});

				});

			Container.getChildSocketInstance()
				.onDisconnect(function(socket) {

					socket.removeAllListeners('child.youtube.error');
					socket.removeAllListeners('child.youtube.played');

					Container.getHTTPSocketInstance().emit('child.disconnected', socket.MIA);

				})
				.onConnection(function(socket) {

					socket
						.on('child.youtube.error', function (error) {
							m_clLog.err(error);
							Container.getChildSocketInstance().emit('child.youtube.error', error);
						})
						.on('child.youtube.played', function () {
							m_clLog.success('child.youtube.played');
							Container.getChildSocketInstance().emit('child.youtube.played');
						});
						
					Container.getHTTPSocketInstance().emit('web.connection', socket.MIA);

				});

	};