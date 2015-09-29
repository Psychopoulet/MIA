
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs'),
		CST_DEP_SikyAPI = require('SIKY-API');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {

		// attributes
			
			var
				m_stSIKYUser,
				m_clSikyAPI = new CST_DEP_SikyAPI(),
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'children'));
				
		// constructor

			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.getconnected');
					socket.removeAllListeners('child.login');
				})
				.onConnection(function(socket) {

					socket
						.on('child.getconnected', function () {
							p_clHTTPSocket.emit('child.getconnected', p_clChildSocket.getConnectedChilds());
						})
						.on('child.login', function (p_stData) {

							if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
								socket.emit('child.logged');
							}
							else {

								m_clSikyAPI.login(p_stData.email, p_stData.password)
									.then(function () {

										m_stSIKYUser = {
											token : m_clSikyAPI.getToken(),
											email : p_stData.email,
											password : p_stData.password
										};

										m_clLog.success('-- [socket server] logged to SIKY');
										socket.emit('child.logged');
										
									})
									.catch(function (e) {
										
										if(e.message) {
											e = e.message;
										}

										m_clLog.err(e);
										socket.emit('child.login.error', e);

									});
									
							}

						});

				});

			p_clChildSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.temperature');
					p_clHTTPSocket.emit('child.disconnected', socket.MIA);
				})
				.onConnection(function(socket) {

					socket
						.on('child.temperature', function (data) {
							socket.MIA.temperature = data;
							p_clHTTPSocket.emit('child.temperature', socket.MIA);
						});
						
					p_clHTTPSocket.emit('child.connection', socket.MIA);

				});

	};