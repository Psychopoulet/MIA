
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_SIKY = require(CST_DEP_Path.join(__dirname, '..', 'node_modules', 'SIKY-API-node', 'api.js')),
		CST_DEP_SocketIO = require('socket.io');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_stSIKYUser,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, 'logs'));
				
		// methodes

			// protected

				function _login(p_stSocket, p_stData) {

					if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
						m_clLog.success('-- [socket server] logged to SIKY');
						p_stSocket.emit('login_ok');
					}
					else {

						CST_DEP_SIKY.login(p_stData.email, p_stData.password)
							.then(function () {
								
								m_stSIKYUser = {
									token : CST_DEP_SIKY.getToken(),
									email : p_stData.email,
									password : p_stData.password
								};

								m_clLog.success('-- [socket server] logged to SIKY');
								p_stSocket.emit('login_ok');
								
							})
							.catch(function (m_sError) {
								m_clLog.err(m_sError);
								p_stSocket.emit('login_ko', m_sError);
							});
							
					}

				}

			// public
				
				this.start = function (p_clHTTPServer, p_fCallback) {

					try {

						m_clSocketServer = CST_DEP_SocketIO.listen(p_clHTTPServer);
						
						m_clLog.success('-- [HTTP socket server] started');
						
						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
					
						m_clSocketServer.sockets.on('connection', function (socket) {

							m_clLog.success('-- [socket client] ' + socket.id + ' connected');

							socket.on('login', function (p_stData) {
								_login(socket, p_stData);
							});
							
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
	