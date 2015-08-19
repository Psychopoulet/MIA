
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_SocketIO = require('socket.io');

// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clSocketServer,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'httpsocket'));
				
		// methodes

			// public
				
				this.start = function (p_clHTTPServer, p_fCallback, p_fCallbackOnConnection) {

					try {

						m_clSocketServer = CST_DEP_SocketIO.listen(p_clHTTPServer);

						m_clLog.success('-- [HTTP socket server] started');

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}

						m_clSocketServer.sockets.on('connection', function (socket) {
							
							m_clLog.success('-- [HTTP socket client] ' + socket.id + ' connected');

							if ('function' === typeof p_fCallbackOnConnection) {
								p_fCallbackOnConnection(socket);
							}

							socket.on('disconnect', function () {
								socket.removeAllListeners();
								m_clLog.info('-- [HTTP socket client] ' + socket.id + ' disconnected');
								socket = null;
							});
							
						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
				this.stop = function (p_fCallback) {

					try {

						m_clSocketServer.sockets.removeAllListeners();
						m_clSocketServer = null;

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
						
					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	