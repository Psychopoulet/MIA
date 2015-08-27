
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
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'childsocket')),
				m_tabOnConnection = [];
				
		// methodes
			
			// public
				
				this.start = function (p_nPort, p_fCallback) {
					
					var deferred = CST_DEP_Q.defer();

						try {

							var clSocketServer = CST_DEP_SocketIO.listen(p_nPort);

							m_clThis.onConnection(function (socket) {

								m_clLog.success('-- [child socket client] ' + socket.id + ' connected');
								
								socket.on('disconnect', function () {
									m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
								});

							});
							
							clSocketServer.sockets.on('connection', function (socket) {
								
								socket.MIA = {};

								m_tabOnConnection.forEach(function (fOnConnection) {
									fOnConnection(socket);
								});
								
							});

							m_clLog.success('-- [child socket server] started');
							
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

				this.onConnection = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnConnection.push(p_fCallback);
					}
					
					return m_clThis;
					
				};
				
	};
	