
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket, p_clSIKYAPI) {

		// attributes
			
			var
				m_stSIKYUser,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'login'));
				
		// constructor

			p_clHTTPSocket.onDisconnect(function(socket) {
				socket.removeAllListeners('login');
			});

			p_clHTTPSocket.onConnection(function(socket) {

				socket
					.on('login', function (p_stData) {

						if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
							socket.emit('logged');
						}
						else {

							p_clSIKYAPI.login(p_stData.email, p_stData.password)
								.then(function () {

									m_stSIKYUser = {
										token : p_clSIKYAPI.getToken(),
										email : p_stData.email,
										password : p_stData.password
									};

									m_clLog.success('-- [socket server] logged to SIKY');
									socket.emit('logged');
									
								})
								.catch(function (m_sError) {
									m_clLog.err(m_sError);
									socket.emit('login_ko', m_sError);
								});
								
						}

					});
					
			});

	};
