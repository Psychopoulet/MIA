
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Q = require('q'),
		CST_DEP_Log = require('logs'),
		CST_DEP_SocketIO = require('socket.io');

// module
	
	module.exports = function () {
	
		// attributes
			
			var
				m_clThis = this,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'httpsocket')),
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnDisconnect = [];
				
		// methodes

			// public
				
				this.start = function (p_clHTTPServer, p_fCallback) {

					var deferred = CST_DEP_Q.defer();

						try {

							m_clSocketServer = CST_DEP_SocketIO.listen(p_clHTTPServer);

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
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;
					
				}

				this.stop = function (p_fCallback) {

					var deferred = CST_DEP_Q.defer();

						try {

							deferred.resolve();
					
						}
						catch (e) {
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
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
	