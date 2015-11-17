
// dépendances
	
	var
		path = require('path'),
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'videos'));
				
		// constructor

			Container.get('server.socket.web')
				.onDisconnect(function(socket) {
					socket.removeAllListeners('web.videos.play');
					socket.removeAllListeners('web.videos.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('web.videos.play', function (data) {

							if (!data) {
								m_clLog.err('Missing data');
								socket.emit('web.videos.error', 'Missing data');
							}
							else if (!data.token) {
								m_clLog.err('Missing \'token\' data');
								socket.emit('web.videos.error', 'Missing \'token\' data');
							}
							else if (!data.url) {
								m_clLog.err('Missing \'url\' data');
								socket.emit('web.videos.error', 'Missing \'url\' data');
							}
							else {
								Container.get('server.socket.child').emitTo(data.token, 'child.videos.play', data.url);
							}

						})
						.on('web.videos.getall', function () {
							socket.emit('web.videos.getall', [{ id: 1, name: 'test', url: 'https://www.youtube.com/embed/ms_ZcfSvcJA' }]);
						});

				});

			Container.get('server.socket.child')
				.onDisconnect(function(socket) {

					socket.removeAllListeners('child.videos.error');
					socket.removeAllListeners('child.videos.played');

					Container.get('server.socket.web').emit('child.disconnected', socket.MIA);

				})
				.onConnection(function(socket) {

					socket
						.on('child.videos.error', function (error) {
							m_clLog.err(error);
							Container.get('server.socket.child').emit('child.videos.error', error);
						})
						.on('child.videos.played', function () {
							m_clLog.success('child.videos.played');
							Container.get('server.socket.child').emit('child.videos.played');
						});
						
					Container.get('server.socket.web').emit('web.connection', socket.MIA);

				});

	};