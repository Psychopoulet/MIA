
"use strict";

// deps
	
	const path = require('path');

// private

	// attrs

		var m_clSocketServer, m_tabOnConnection = [], m_tabOnLog = [], m_tabOnDisconnect = [];

// module

module.exports = class HTTPSocket {
	
	start (Container) {

		return new Promise(function(resolve, reject) {

			try {

				m_clSocketServer = require('socket.io').listen(Container.get('http'));

				m_clSocketServer.sockets.on('connection', function (socket) {

					Container.get('logs').info('-- [HTTP socket client] ' + socket.id + ' connected');
					
					socket.on('disconnect', function () {
						
						Container.get('logs').info('-- [HTTP socket client] ' + socket.id + ' disconnected');

						m_tabOnDisconnect.forEach(function (fOnDisconnect) {
							fOnDisconnect(socket);
						});

					});
					
					m_tabOnConnection.forEach(function (fOnConnection) {
						fOnConnection(socket);
					});
					
				});

				if (Container.get('conf').get('ssl')) {
					Container.get('logs').success('-- [HTTP socket server] avec SSL démarré sur le port ' + Container.get('conf').get('webport'));
				}
				else {
					Container.get('logs').success('-- [HTTP socket server] démarré sur le port ' + Container.get('conf').get('webport'));
				}

				resolve();

			}
			catch (e) {
				reject((e.message) ? e.message : e);
			}

		});
		
	}

	emit (order, data) {
		m_clSocketServer.sockets.emit(order, data);
	}
	
	emitTo (token, order, data) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
				m_clSocketServer.sockets.sockets[key].emit(order, data);
				break;
			}

		}

		return this;
		
	}

	setTokenToSocketById (id, token) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].id === id) {
				m_clSocketServer.sockets.sockets[key].token = token;
				break;
			}

		}

		return this;
		
	}
	
	disconnect (token) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
				m_clSocketServer.sockets.sockets[key].disconnect();
				break;
			}

		}

		return this;
		
	}
	
	getSockets () {

		let tabResult = [];

			for (let key in m_clSocketServer.sockets.sockets) {
				tabResult.push(m_clSocketServer.sockets.sockets[key]);
			}

		return tabResult;

	}
	
	getSocket (token) {

		let result = null;

			for (let key in m_clSocketServer.sockets.sockets) {

				if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
					result = m_clSocketServer.sockets.sockets[key];
					break;
				}

			}

		return result;
		
	}
	
	// callbacks
	
	fireLogin (socket, client) {

		m_tabOnLog.forEach(function(callback) {
			callback(socket, client);
		});

		return this;
		
	}
	
	onConnection (callback) {

		if ('function' === typeof callback) {
			m_tabOnConnection.push(callback);
		}
		
		return this;
		
	}
	
	onLog (callback) {

		if ('function' === typeof callback) {
			m_tabOnLog.push(callback);
		}
		
		return this;
		
	}
	
	onDisconnect (callback, callbackLog, callbackConnection) {

		if ('function' === typeof callback) {
			m_tabOnDisconnect.push(callback);
		}
		
		if ('function' === typeof callbackLog) {

			for (let i = 0; i < m_tabOnLog.length; ++i) {

				if (m_tabOnLog[i] === callbackLog) {
					m_tabOnLog.splice(i, 1);
					break;
				}

			}

		}
		
		if ('function' === typeof callbackConnection) {

			for (let i = 0; i < m_tabOnConnection.length; ++i) {

				if (m_tabOnConnection[i] === callbackConnection) {
					m_tabOnConnection.splice(i, 1);
					break;
				}

			}

		}
		
		return this;
		
	}
	
};
