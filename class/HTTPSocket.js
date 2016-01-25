
// dépendances
	
	const 	path = require('path'),
			q = require('q');

// module
	
	module.exports = function (Container) {
	
		"use strict";
		
		// attributes
			
			var
				that = this,
				logs = Container.get('logs'),
				m_clLog = new logs(path.join(__dirname, '..', 'logs', 'httpsocket')),
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnLog = [],
				m_tabOnDisconnect = [];
				
		// methodes

			// public
				
				this.start = function () {

					var deferred = q.defer();

						try {

							m_clSocketServer = require('socket.io').listen(Container.get('http'));

							m_clSocketServer.sockets.on('connection', function (socket) {

								m_clLog.success('-- [HTTP socket client] ' + socket.id + ' connected');
								
								socket.on('disconnect', function () {
									
									m_clLog.info('-- [HTTP socket client] ' + socket.id + ' disconnected');

									m_tabOnDisconnect.forEach(function (fOnDisconnect) {
										fOnDisconnect(socket);
									});

								});
								
								m_tabOnConnection.forEach(function (fOnConnection) {
									fOnConnection(socket);
								});
								
							});
							
							m_clLog.success('-- [HTTP socket server] started on port ' + Container.get('conf').get('webport'));

							deferred.resolve();

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;
					
				}

				this.stop = function () {

					var deferred = q.defer();

						try {
							deferred.resolve();
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

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
	