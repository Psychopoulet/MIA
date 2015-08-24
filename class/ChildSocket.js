
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_SocketIO = require('socket.io');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clThis = this,
				m_clSocketServer,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'childsocket')),
				m_tabOnConnection = [];
				
		// methodes
			
			// public
				
				this.start = function (p_nPort, p_fCallback) {
					
					try {

						m_clSocketServer = CST_DEP_SocketIO.listen(p_nPort);

						m_clLog.success('-- [child socket server] started');
						
						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}

						m_clThis.onConnection(function (socket) {

							m_clLog.success('-- [child socket client] ' + socket.id + ' connected');
							
							socket.on('disconnect', function () {
								m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
							});

						});
						
						m_clSocketServer.sockets.on('connection', function (socket) {

							m_tabOnConnection.forEach(function (fOnConnection) {
								fOnConnection(socket);
							});
							
						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
					return m_clThis;
					
				};
				
				this.stop = function (p_fCallback) {

					try {

						m_tabOnConnection = [];

						m_clSocketServer.sockets.removeAllListeners();
						m_clSocketServer = null;

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
					
					}
					catch (e) {
						m_clLog.err(e);
					}
					
					return m_clThis;
					
				};

				this.onConnection = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnConnection.push(p_fCallback);
					}
							
					return m_clThis;
					
				};
				
	};
	