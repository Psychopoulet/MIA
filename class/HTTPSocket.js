
// dépendances
	
	var
		path = require('path'),
		q = require('q'),
		Logs = require(path.join(__dirname, 'Logs.js'));

// module
	
	module.exports = function () {
	
		"use strict";
		
		// attributes
			
			var
				m_clThis = this,
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'httpsocket')),
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnDisconnect = [];
				
		// methodes

			// public
				
				this.start = function (p_clHTTPServer, p_fCallback) {

					var deferred = q.defer();

						try {

							m_clSocketServer = require('socket.io').listen(p_clHTTPServer);

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
							
							m_clLog.success('-- [HTTP socket server] started');

							deferred.resolve();

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;
					
				}

				this.stop = function (p_fCallback) {

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
					
					return m_clThis;
					
				};
				
				this.onDisconnect = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnDisconnect.push(p_fCallback);
					}
							
					return m_clThis;
					
				};
				
	};
	