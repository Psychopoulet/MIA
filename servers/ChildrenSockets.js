
"use strict";

// dépendances
	
	const path = require('path');
	
// private

	// attrs

		var m_clSocketServer, m_tabOnConnection = [], m_tabOnLog = [], m_tabOnDisconnect = [];

	// methodes

		// private

			function _initServer(Container) {

				return new Promise(function(resolve, reject) {

					let sDirSSL = path.join(__dirname, '..', 'ssl')

					try {

						if (!Container.get('conf').get('ssl')) {
							Container.get('logs').success('-- [child socket server] démarré sur le port ' + Container.get('conf').get('childrenport'));
							resolve(require('socket.io').listen(Container.get('conf').get('childrenport')));
						}
						else {

							Container.get('openssl').createCertificate(
								path.join(sDirSSL, 'server.key'),
								path.join(sDirSSL, 'server.csr'),
								path.join(sDirSSL, 'server.crt')
							).then(function(keys) {

								let server = require('https').createServer({
									key: keys.privateKey,
									cert: keys.certificate
								});

								server.listen(Container.get('conf').get('childrenport'), function() {
									Container.get('logs').success('-- [child socket server] avec SSL démarré sur le port ' + Container.get('conf').get('childrenport'));
									resolve(require('socket.io')(server));
								});

							})
							.catch(function(err) {
								Container.get('logs').err('-- [SimpleSSL] : ' ((e.message) ? e.message : e));
								reject((e.message) ? e.message : e);
							});

						}

					}
					catch (e) {
						reject(((e.message) ? e.message : e));
					}

				});

			}
			
// module
	
module.exports = class ServerChildrenSockets {

	start (Container) {

		return new Promise(function(resolve, reject) {

			try {

				_initServer(Container).then(function(server) {

					m_clSocketServer = server;

					m_clSocketServer.sockets.on('connection', function (socket) {

						Container.get('logs').info('-- [child socket client] ' + socket.id + ' connected');
						
						socket.on('disconnect', function () {
							
							Container.get('logs').info('-- [child socket client] ' + socket.id + ' disconnected');
							
							m_tabOnDisconnect.forEach(function (fOnDisconnect) {
								fOnDisconnect(socket);
							});

						});

						m_tabOnConnection.forEach(function (fOnConnection) {
							fOnConnection(socket);
						});
						
					});

					resolve();

				})
				.catch(reject);

			}
			catch (e) {
				reject((e.message) ? e.message : e);
			}

		});

	}
	
	emit (p_sOrder, p_vData) {
		m_clSocketServer.sockets.emit(p_sOrder, p_vData);
	}
	
	emitTo (p_sToken, p_sOrder, p_vData) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
				m_clSocketServer.sockets.sockets[key].emit(p_sOrder, p_vData);
				break;
			}

		}

		return this;
		
	}
	
	setTokenToSocketById (p_sId, p_sToken) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].id === p_sId) {
				m_clSocketServer.sockets.sockets[key].token = p_sToken;
				break;
			}

		}

		return this;
		
	}
	
	disconnect (p_sToken) {

		for (let key in m_clSocketServer.sockets.sockets) {

			if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
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
	
	getSocket (p_sToken) {

		let result = null;

			for (let key in m_clSocketServer.sockets.sockets) {

				if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
					result = m_clSocketServer.sockets.sockets[key];
					break;
				}

			}

		return result;
		
	}
	
	// callbacks

	fireLogin (socket, child) {

		m_tabOnLog.forEach(function(callback) {
			callback(socket, child);
		});

		return this;
		
	}
	
	onConnection (p_fCallback) {

		if ('function' === typeof p_fCallback) {
			m_tabOnConnection.push(p_fCallback);
		}
		
		return this;
		
	}
	
	onLog (p_fCallback) {

		if ('function' === typeof p_fCallback) {
			m_tabOnLog.push(p_fCallback);
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
