
// dépendances
	
	var
		path = require('path'),
		q = require('q'),
		
		Container = require(path.join(__dirname, 'Container.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'childsocket')),
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnLog = [],
				m_tabOnDisconnect = [];
				
		// methodes
			
			// public
				
				this.start = function () {
					
					var deferred = q.defer(), nChildrenPort = Container.get('conf').get('childrenport');

						try {

							m_clSocketServer = require('socket.io').listen(nChildrenPort);

							m_clSocketServer.sockets.on('connection', function (socket) {

								m_clLog.success('-- [child socket client] ' + socket.id + ' connected');
								
								socket.on('disconnect', function () {
									
									m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
									
									m_tabOnDisconnect.forEach(function (fOnDisconnect) {
										fOnDisconnect(socket);
									});

								});

								m_tabOnConnection.forEach(function (fOnConnection) {
									fOnConnection(socket);
								});
								
							});

							m_clLog.success('-- [child socket server] started on port ' + nChildrenPort);
							
							deferred.resolve();

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
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

					for (var i = 0; i < m_clSocketServer.sockets.sockets.length; ++i) {

						if (m_clSocketServer.sockets.sockets[i].token && m_clSocketServer.sockets.sockets[i].token === p_sToken) {
							m_clSocketServer.sockets.sockets[i].emit(p_sOrder, p_vData);
							break;
						}

					}

					return that;
					
				};
				
				this.setTokenToSocketById = function (p_sId, p_sToken) {

					for (var i = 0; i < m_clSocketServer.sockets.sockets.length; ++i) {

						if (m_clSocketServer.sockets.sockets[i].id === p_sId) {
							m_clSocketServer.sockets.sockets[i].token = p_sToken;
							break;
						}

					}

					return that;
					
				};
				
				this.disconnect = function (p_sToken) {

					for (var i = 0; i < m_clSocketServer.sockets.sockets.length; ++i) {

						if (m_clSocketServer.sockets.sockets[i].token && m_clSocketServer.sockets.sockets[i].token === p_sToken) {
							m_clSocketServer.sockets.sockets[i].disconnect();
							break;
						}

					}

					return that;
					
				};
				
				this.getSockets = function () {
					return m_clSocketServer.sockets.sockets;
				};
				
				this.getSocket = function (p_sToken) {

					var result = null;

						for (var i = 0; i < m_clSocketServer.sockets.sockets.length; ++i) {

							if (m_clSocketServer.sockets.sockets[i].token && m_clSocketServer.sockets.sockets[i].token === p_sToken) {
								result = m_clSocketServer.sockets.sockets[i];
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
	