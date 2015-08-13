
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_SIKY = require(CST_DEP_Path.join(__dirname, '..', 'node_modules', 'SIKY-API-node', 'api.js')),
		CST_DEP_W3VoicesManager = require(CST_DEP_Path.join(__dirname, 'W3VoicesManager.js')),
		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var m_stSIKYUser,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'MIA')),
				m_clW3VoicesManager = new CST_DEP_W3VoicesManager(),
				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket();
				
		// methodes

			// protected

				function _login(p_stSocket, p_stData) {

					if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
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
				
				this.start = function (p_fCallback) {

					try {

						m_clHTTPServer.start(1337, function () {

							m_clHTTPSocket.start(m_clHTTPServer.getServer(), function () {

								m_clHTTPSocket.onConnection(function (socket) {

									socket.on('login', function (p_stData) {
										_login(socket, p_stData);
									});
									
								});

								m_clChildSocket.start(1338, function () {
									m_clW3VoicesManager.playRandomCharacter('ready', p_fCallback);
								});

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

						return;
						
						m_clChildSocket.stop(function () {

							m_clHTTPSocket.stop(function () {

								m_clHTTPServer.stop(p_fCallback);

							});

						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	