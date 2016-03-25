
"use strict";

// dépendances
	
	const path = require('path');
	
// module
	
	module.exports = function (Container) {

		"use strict";
		
		// attributes
			
			var that = this,
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnLog = [],
				m_tabOnDisconnect = [];
				
		// methodes

			// private

				function _initServer() {

					return new Promise(function(resolve, reject) {

						var sDirSSL = path.join(__dirname, '..', 'ssl')

						try {

							if (!Container.get('conf').get('ssl')) {
								Container.get('logs').success('-- [child socket server] started on port ' + Container.get('conf').get('childrenport'));
								resolve(require('socket.io').listen(Container.get('conf').get('childrenport')));
							}
							else {

								Container.get('openssl').createCertificate(
									path.join(sDirSSL, 'server.key'),
									path.join(sDirSSL, 'server.csr'),
									path.join(sDirSSL, 'server.crt')
								).then(function(keys) {

									var server = require('https').createServer({
										key: keys.privateKey,
										cert: keys.certificate
									});

									server.listen(Container.get('conf').get('childrenport'), function() {
										Container.get('logs').success('-- [child socket server] with ssl started on port ' + Container.get('conf').get('childrenport'));
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
			
			// public
				
				this.start = function () {

					return new Promise(function(resolve, reject) {

						try {

							_initServer().then(function(server) {

								m_clSocketServer = server;

								m_clSocketServer.sockets.on('connection', function (socket) {

									Container.get('logs').success('-- [child socket client] ' + socket.id + ' connected');
									
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

				};
				
				this.emit = function (p_sOrder, p_vData) {
					m_clSocketServer.sockets.emit(p_sOrder, p_vData);
				};
				
				this.emitTo = function (p_sToken, p_sOrder, p_vData) {

					for (var key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
							m_clSocketServer.sockets.sockets[key].emit(p_sOrder, p_vData);
							break;
						}

					}

					return that;
					
				};
				
				this.setTokenToSocketById = function (p_sId, p_sToken) {

					for (var key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].id === p_sId) {
							m_clSocketServer.sockets.sockets[key].token = p_sToken;
							break;
						}

					}

					return that;
					
				};
				
				this.disconnect = function (p_sToken) {

					for (var key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
							m_clSocketServer.sockets.sockets[key].disconnect();
							break;
						}

					}

					return that;
					
				};
				
				this.getSockets = function () {

					var tabResult = [];

						for (var key in m_clSocketServer.sockets.sockets) {
							tabResult.push(m_clSocketServer.sockets.sockets[key]);
						}

					return tabResult;

				};
				
				this.getSocket = function (p_sToken) {

					var result = null;

						for (var key in m_clSocketServer.sockets.sockets) {

							if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === p_sToken) {
								result = m_clSocketServer.sockets.sockets[key];
								break;
							}

						}

					return result;
					
				};
				
				// callbacks

					this.fireLogin = function (socket, child) {

						m_tabOnLog.forEach(function(callback) {
							callback(socket, child);
						});

						return that;
						
					};
					
					this.onConnection = function (p_fCallback) {

						if ('function' === typeof p_fCallback) {
							m_tabOnConnection.push(p_fCallback);
						}
						
						return that;
						
					};
					
					this.onLog = function (p_fCallback) {

						if ('function' === typeof p_fCallback) {
							m_tabOnLog.push(p_fCallback);
						}
						
						return that;
						
					};
					
					this.onDisconnect = function (p_fCallback) {

						if ('function' === typeof p_fCallback) {
							m_tabOnDisconnect.push(p_fCallback);
						}
								
						return that;
						
					};
					
	};
	