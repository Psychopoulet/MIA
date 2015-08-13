
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_SocketIO = require('socket.io');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clSocketServer,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'childsocket'));
				
		// methodes
			
			// public
				
				this.start = function (p_nPort, p_fCallback) {
					
					try {

						m_clSocketServer = CST_DEP_SocketIO.listen(p_nPort);

						m_clLog.success('-- [child socket server] started');
						
						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
						
						this.onConnection(function (socket) {

							m_clLog.success('-- [child socket client] ' + socket.id + ' connected');

							socket.on('disconnect', function () {
								socket.removeAllListeners();
								m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
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
				
				this.onConnection = function (p_fCallback) {

					try {

						if (m_clSocketServer && 'function' === typeof p_fCallback) {

							m_clSocketServer.sockets.on('connection', function (socket) {
								p_fCallback(socket);
							});

						}

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	