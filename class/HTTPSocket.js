
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

			// public
				
				this.start = function () {

					return new Promise(function(resolve, reject) {

						try {

							m_clSocketServer = require('socket.io').listen(Container.get('http'));

							m_clSocketServer.sockets.on('connection', function (socket) {

								Container.get('logs').success('-- [HTTP socket client] ' + socket.id + ' connected');
								
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
								Container.get('logs').success('-- [HTTP socket server] with ssl started on port ' + Container.get('conf').get('webport'));
							}
							else {
								Container.get('logs').success('-- [HTTP socket server] started on port ' + Container.get('conf').get('webport'));
							}

							resolve();

						}
						catch (e) {
							reject((e.message) ? e.message : e);
						}

					});
					
				}

				this.emit = function (order, data) {
					m_clSocketServer.sockets.emit(order, data);
				};
				
				this.emitTo = function (token, order, data) {

					for (let key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
							m_clSocketServer.sockets.sockets[key].emit(order, data);
							break;
						}

					}

					return that;
					
				};

				this.setTokenToSocketById = function (id, token) {

					for (let key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].id === id) {
							m_clSocketServer.sockets.sockets[key].token = token;
							break;
						}

					}

					return that;
					
				};
				
				this.disconnect = function (token) {

					for (let key in m_clSocketServer.sockets.sockets) {

						if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
							m_clSocketServer.sockets.sockets[key].disconnect();
							break;
						}

					}

					return that;
					
				};
				
				this.getSockets = function () {

					let tabResult = [];

						for (let key in m_clSocketServer.sockets.sockets) {
							tabResult.push(m_clSocketServer.sockets.sockets[key]);
						}

					return tabResult;

				};
				
				this.getSocket = function (token) {

					let result = null;

						for (let key in m_clSocketServer.sockets.sockets) {

							if (m_clSocketServer.sockets.sockets[key].token && m_clSocketServer.sockets.sockets[key].token === token) {
								result = m_clSocketServer.sockets.sockets[key];
								break;
							}

						}

					return result;
					
				};
				
				// callbacks
					
					this.fireLogin = function (socket, client) {

						m_tabOnLog.forEach(function(callback) {
							callback(socket, client);
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
	