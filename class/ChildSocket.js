
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
				m_clSocketServer,
				m_tabOnConnection = [],
				m_tabOnDisconnect = [];
				
		// methodes
			
			// public
				
				this.start = function (p_nPort, p_fCallback) {
					
					var deferred = CST_DEP_Q.defer();

						try {

							m_clSocketServer = CST_DEP_SocketIO.listen(p_nPort);

							m_clSocketServer.sockets.on('connection', function (socket) {

								socket.MIA = {};

								m_clLog.success('-- [child socket client] ' + socket.id + ' connected');
								
								socket.on('disconnect', function () {
									
									m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
									
									socket.removeAllListeners('w3');
									socket.removeAllListeners('token_get');
									socket.removeAllListeners('token_empty');
									socket.removeAllListeners('token_error');

									m_tabOnDisconnect.forEach(function (fOnDisconnect) {
										fOnDisconnect(socket);
									});

								});

								socket
									.on('token_get', function (sToken) {
										
										socket.MIA.token = sToken;
										
										m_clLog.success('-- [child socket client] get token \'' + sToken + '\'');

										m_tabOnConnection.forEach(function (fOnConnection) {
											fOnConnection(socket);
										});
										
										socket.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
										
									})
									.on('token_empty', function () {
										
										var sAlpha = 'abcdefghijklmnopqrstuvwxyz0123456789', sToken = '';
										
										for (var i = 0; i < 10; ++i) {
											var al = Math.floor(Math.random() * sAlpha.length);
												al = (al < 0) ? 0 : (al >= sAlpha.length) ? sAlpha.length - 1 : al;
											sToken += sAlpha.substring(al, al+1);
										}
										
										socket.emit('token_set', sToken);
										
									})
									.on('token_error', function (err) {
										m_clLog.err(err);
									})
									.on('w3', function (data) {

										if (data && data.error) {
											m_clLog.err(data.error);
										}

									});
									
								socket.emit('token_get');
								
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
	