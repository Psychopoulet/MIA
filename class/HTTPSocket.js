
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_SocketIO = require('socket.io');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clHTTPServer,
				m_sTocken = '',
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, 'logs'));
				
		// methodes

			// public
				
				this.setHTTPServer = function (p_clHTTPServer) {
					m_clHTTPServer = p_clHTTPServer;
					return this;
				};
				
				this.start = function (p_fCallback) {

					try {

						m_clSocketServer = CST_DEP_SocketIO.listen(m_clHTTPServer);
						
						m_clLog.success('-- [HTTP socket server] started');
						
						m_clSocketServer.sockets.on('connection', function (socket) {
							
							m_clLog.success('-- [socket client] ' + socket.id + ' connected');

							if ('function' === typeof p_fCallback) {
								p_fCallback();
							}
					
							if ('' != m_sTocken) {
								m_clSocketServer.sockets.emit('logged');
							}
							else {

								socket.on('login', function (p_stData) {
									
									CST_DEP_SIKY.login(p_stData.email, p_stData.password)
										.then(function () {
											
											m_clLog.success('-- [socket server] logged to SIKY');
											m_sTocken = CST_DEP_SIKY.getToken();
											m_clSocketServer.sockets.emit('logged');
											
										})
										.catch(function (m_sError) {
											m_clLog.error(m_sError);
										});
										
								});
								
							}

							socket.on('disconnect', function () {
								
								socket.removeAllListeners();
								
								m_clLog.info('-- [socket client] ' + socket.id + ' disconnected');
								
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

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
					
					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	