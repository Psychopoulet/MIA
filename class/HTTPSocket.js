
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
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'httpsocket')),
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnDisconnect = [];
				
		// methodes

			// public
				
				this.start = function () {

					var deferred = q.defer();

						try {

							m_clSocketServer = require('socket.io').listen(Container.get('server.http').getServer());

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
							
							m_clLog.success('-- [HTTP socket server] started on port ' + Container.get('conf').get('clientsport'));

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
				
				this.onConnection = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnConnection.push(p_fCallback);
					}
					
					return that;
					
				};
				
				this.onDisconnect = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnDisconnect.push(p_fCallback);
					}
							
					return that;
					
				};
				
				this.setTokenToSocketById = function (p_sId, p_sToken) {

					m_clSocketServer.sockets.sockets.forEach(function(socket, key) {

						if (socket.id == p_sId) {
							m_clSocketServer.sockets.sockets[key].token = p_sToken;
						}

					});
		
					return that;
					
				};
				
				this.emitTo = function (p_sToken, p_sOrder, p_vData) {

					m_clSocketServer.sockets.sockets.forEach(function(socket, key) {

						if (socket.token && socket.token === p_sToken) {
							socket.emit(p_sOrder, p_vData);
						}

					});
		
					return that;
					
				};
				
				this.disconnect = function (p_sToken) {

					m_clSocketServer.sockets.sockets.forEach(function(socket, key) {

						if (socket.token && socket.token === p_sToken) {
							socket.disconnect();
						}

					});
		
					return that;
					
				};
				
				this.getSockets = function () {
					return m_clSocketServer.sockets.sockets;
				};
				
	};
	